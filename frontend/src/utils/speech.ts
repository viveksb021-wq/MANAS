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

  const options: SpeakOptions = typeof optionsOrOnEnd === 'function'
    ? { onEnd: optionsOrOnEnd, onUnavailable: legacyOnUnavailable }
    : (optionsOrOnEnd || {});

  const normLang = normalizeLanguageCode(lang);
  const langDetails = getLanguageDetails(normLang);

  // Check honest device voice capability
  const capability = checkTTSCapability(normLang);

  if (!capability.available || !capability.voice) {
    console.warn(`[MANAS TTS] Genuine voice for ${langDetails.name} is unavailable on this device.`);
    const notice = capability.message || `Voice for ${langDetails.name} is currently unavailable on this device. MANAS will continue in ${langDetails.name} text.`;
    if (options.onUnavailable) {
      options.onUnavailable(notice);
    }
    if (options.onEnd) {
      // Return state to idle cleanly
      options.onEnd();
    }
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = capability.voice;
    utterance.lang = capability.voice.lang || langDetails.speechLocale;
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
  start: () => void;
  stop: () => void;
}

/**
 * Language-aware speech recognition (STT) constructor.
 * Uses the exact authoritative speechLocale for the selected language.
 */
export const createSpeechRecognizer = (
  onResult: (transcript: string) => void,
  onError?: (err: any) => void,
  lang: string = 'en',
  onUnavailable?: (notice: string) => void
): VoiceListener | null => {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('[MANAS STT] Speech Recognition not supported in this browser.');
    if (onUnavailable) {
      onUnavailable('Voice input is not supported on this browser.');
    }
    return null;
  }

  const normLang = normalizeLanguageCode(lang);
  const langDetails = getLanguageDetails(normLang);

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = langDetails.speechLocale;

    recognition.onresult = (event: any) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'language-not-supported') {
        const msg = `Voice input for ${langDetails.name} is unavailable on this device.`;
        if (onUnavailable) onUnavailable(msg);
      }
      if (onError) onError(event.error);
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch (e) {
          if (onError) onError(e);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore already stopped
        }
      }
    };
  } catch (err) {
    console.warn('[MANAS STT] Initialization failed:', err);
    if (onUnavailable) onUnavailable(`Voice input for ${langDetails.name} is unavailable on this device.`);
    return null;
  }
};
