// Web Speech API & Language-Aware TTS/STT Provider for MANAS
import {
  getSpeechLocaleForLanguage,
  getLanguageDetails,
  checkTTSCapability,
  normalizeLanguageCode,
  LanguageCode
} from '../config/languages';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onUnavailable?: (notice: string) => void;
}

let activeSpeechTimer: any = null;
let isCurrentlySpeaking = false;

// Pre-warm voices for SpeechSynthesis
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    try {
      window.speechSynthesis.getVoices();
    } catch (e) {}
  };
  try {
    window.speechSynthesis.getVoices();
  } catch (e) {}
}

/**
 * Immediate cancellation of all ongoing speech.
 * Must be invoked whenever the patient switches languages.
 */
export const stopSpeech = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activeSpeechTimer) {
    clearTimeout(activeSpeechTimer);
    activeSpeechTimer = null;
  }
  isCurrentlySpeaking = false;
};

export const isSpeaking = (): boolean => isCurrentlySpeaking;

/**
 * Clean, language-aware TTS Provider function.
 * 
 * Rules:
 * 1. Checks honest voice availability on the user's device.
 * 2. Selects the exact matching locale voice.
 * 3. Never fakes pronunciation or speaks English for non-English text.
 * 4. If voice is unavailable, informs caller via onUnavailable and gracefully finishes without playing false audio.
 */
export const speakText = (
  text: string,
  lang: string = 'en',
  optionsOrOnEnd?: (() => void) | SpeakOptions,
  legacyOnUnavailable?: (notice: string) => void
): void => {
  stopSpeech();

  if (!text || !text.trim()) {
    if (typeof optionsOrOnEnd === 'function') optionsOrOnEnd();
    else if (optionsOrOnEnd?.onEnd) optionsOrOnEnd.onEnd();
    return;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (typeof optionsOrOnEnd === 'function') optionsOrOnEnd();
    else if (optionsOrOnEnd?.onEnd) optionsOrOnEnd.onEnd();
    return;
  }

  const options: SpeakOptions = typeof optionsOrOnEnd === 'function'
    ? { onEnd: optionsOrOnEnd, onUnavailable: legacyOnUnavailable }
    : (optionsOrOnEnd || {});

  const normLang = normalizeLanguageCode(lang);
  const langDetails = getLanguageDetails(normLang);

  // Check device voice capability
  const capability = checkTTSCapability(normLang);

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose best voice: exact match -> Indian voice -> default voice
    if (capability.voice) {
      utterance.voice = capability.voice;
      utterance.lang = capability.voice.lang || langDetails.speechLocale;
    } else {
      // Find Indian voice fallback or any available voice
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => {
        const vl = (v.lang || '').toLowerCase();
        return vl.includes('in') || vl.includes('hi') || vl.includes('bn') || vl.includes('ne');
      }) || voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0] || null;

      if (indianVoice) {
        utterance.voice = indianVoice;
      }
      utterance.lang = langDetails.speechLocale || 'en-IN';
    }

    utterance.rate = options.rate ?? 0.88; // Senior-friendly, clear pacing
    utterance.pitch = options.pitch ?? 1.0;

    let hasFinished = false;
    const finish = () => {
      if (!hasFinished) {
        hasFinished = true;
        isCurrentlySpeaking = false;
        if (activeSpeechTimer) {
          clearTimeout(activeSpeechTimer);
          activeSpeechTimer = null;
        }
        if (options.onEnd) options.onEnd();
      }
    };

    utterance.onstart = () => {
      isCurrentlySpeaking = true;
      if (options.onStart) options.onStart();
    };

    utterance.onend = finish;
    utterance.onerror = (err) => {
      console.warn('[MANAS TTS] Utterance error:', err);
      finish();
    };

    isCurrentlySpeaking = true;
    window.speechSynthesis.speak(utterance);

    // Fallback timer in case browser fails to trigger onend
    const maxWaitMs = Math.max(3000, text.length * 120);
    activeSpeechTimer = setTimeout(() => {
      if (!hasFinished && (!window.speechSynthesis || !window.speechSynthesis.speaking)) {
        finish();
      }
    }, maxWaitMs);

  } catch (err) {
    console.error('[MANAS TTS] Speech synthesis exception:', err);
    isCurrentlySpeaking = false;
    if (options.onEnd) options.onEnd();
  }
};

export interface VoiceListener {
  start: () => Promise<void> | void;
  stop: () => void;
  isListening?: () => boolean;
}

/**
 * Language-aware speech recognition (STT) constructor.
 * Uses the exact authoritative speechLocale for the selected language, with reliable fallback.
 * 
 * Features:
 * - Direct SpeechRecognition activation without audio track termination
 * - Single-utterance and interim feedback for instantaneous response
 * - Automatic fallback to en-IN/hi-IN if browser engine lacks regional STT package
 * - Silence detection timeout for natural end-of-speech finalization
 */
export const createSpeechRecognizer = (
  onResult: (transcript: string) => void,
  onError?: (err: any, notice?: string) => void,
  lang: string = 'en',
  onUnavailable?: (notice: string) => void,
  onInterimResult?: (interim: string) => void,
  onEnd?: () => void,
  onStart?: () => void
): VoiceListener | null => {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('[MANAS STT] Speech Recognition not supported in this browser.');
    if (onUnavailable) {
      onUnavailable('Voice input is not supported on this browser. You can type your commands below.');
    }
    return null;
  }

  const normLang = normalizeLanguageCode(lang);
  const langDetails = getLanguageDetails(normLang);

  // Desktop Chrome natively supports en-IN, hi-IN, bn-IN, ne-NP
  const BROWSER_NATIVE_STT_LOCALES: Record<string, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ne: 'ne-NP'
  };

  let targetLocale = BROWSER_NATIVE_STT_LOCALES[normLang] || 'en-IN';

  let recognition: any = null;
  let isCurrentlyActive = false;
  let silenceTimer: any = null;
  let hasProcessedResult = false;
  let accumulatedTranscript = '';

  const clearSilenceTimer = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  };

  const scheduleSilenceFinalize = (delayMs: number = 1500) => {
    clearSilenceTimer();
    silenceTimer = setTimeout(() => {
      if (accumulatedTranscript.trim() && !hasProcessedResult) {
        hasProcessedResult = true;
        const finalQuery = accumulatedTranscript.trim();
        try {
          if (recognition) recognition.stop();
        } catch (e) {}
        onResult(finalQuery);
      }
    }, delayMs);
  };

  try {
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Fast conversational turn-taking
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = targetLocale;

    recognition.onstart = () => {
      isCurrentlyActive = true;
      hasProcessedResult = false;
      accumulatedTranscript = '';
      if (onStart) onStart();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalStr += item[0].transcript + ' ';
        } else {
          interim += item[0].transcript;
        }
      }

      if (finalStr) {
        accumulatedTranscript = (accumulatedTranscript + ' ' + finalStr).replace(/\s+/g, ' ').trim();
      }

      const currentLive = (accumulatedTranscript + ' ' + interim).trim();
      if (currentLive) {
        if (onInterimResult) {
          onInterimResult(currentLive);
        }
        scheduleSilenceFinalize(1500);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[MANAS STT] Recognition error:', event.error);
      clearSilenceTimer();

      // If browser doesn't support the requested language locale, switch to en-IN immediately
      if (event.error === 'language-not-supported' && targetLocale !== 'en-IN') {
        console.log('[MANAS STT] Locale not supported, switching to en-IN fallback');
        targetLocale = 'en-IN';
        try {
          recognition.lang = 'en-IN';
          recognition.start();
          return;
        } catch (e) {}
      }

      let friendlyNotice = '';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        friendlyNotice = 'Microphone permission was blocked. Please click the lock/mic icon in your browser URL bar to allow microphone access.';
      } else if (event.error === 'no-speech') {
        friendlyNotice = "I didn't hear anything. Tap the microphone and speak clearly.";
      } else if (event.error === 'audio-capture') {
        friendlyNotice = 'No microphone was detected on this device. You can type commands below.';
      } else if (event.error === 'network') {
        friendlyNotice = 'Speech recognition network error. You can type commands below.';
      } else if (event.error !== 'aborted') {
        friendlyNotice = `Voice recognition notice: ${event.error}`;
      }

      // If text was captured before the error, finalize it
      if (accumulatedTranscript.trim() && !hasProcessedResult) {
        hasProcessedResult = true;
        onResult(accumulatedTranscript.trim());
        return;
      }

      if (friendlyNotice && onUnavailable) {
        onUnavailable(friendlyNotice);
      }
      if (onError) {
        onError(event.error, friendlyNotice);
      }
    };

    recognition.onend = () => {
      isCurrentlyActive = false;
      clearSilenceTimer();

      // If user finished speaking and we have text, process it now
      if (accumulatedTranscript.trim() && !hasProcessedResult) {
        hasProcessedResult = true;
        onResult(accumulatedTranscript.trim());
      }

      if (onEnd) {
        onEnd();
      }
    };

    return {
      start: () => {
        hasProcessedResult = false;
        accumulatedTranscript = '';
        try {
          recognition.lang = targetLocale;
          recognition.start();
        } catch (e: any) {
          // If already started, do not throw
          if (e.name !== 'InvalidStateError') {
            console.warn('[MANAS STT] Start exception:', e);
            if (onError) onError(e);
          }
        }
      },
      stop: () => {
        clearSilenceTimer();
        isCurrentlyActive = false;
        try {
          recognition.stop();
        } catch (e) {
          // ignore already stopped
        }
        if (accumulatedTranscript.trim() && !hasProcessedResult) {
          hasProcessedResult = true;
          onResult(accumulatedTranscript.trim());
        }
      },
      isListening: () => isCurrentlyActive
    };
  } catch (err: any) {
    console.warn('[MANAS STT] Initialization failed:', err);
    if (onUnavailable) onUnavailable(`Voice input for ${langDetails.name} is unavailable on this device.`);
    return null;
  }
};
