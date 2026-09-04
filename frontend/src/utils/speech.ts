// Web Speech API Helpers for MANAS

export const speakText = (text: string, lang: string = 'en-US'): void => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower speed for elderly legibility
  utterance.pitch = 1.0;

  // Try selecting a warm female/natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.lang.includes(lang.split('-')[0]) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Female')));
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export interface VoiceListener {
  start: () => void;
  stop: () => void;
}

export const createSpeechRecognizer = (
  onResult: (transcript: string) => void,
  onError?: (err: any) => void
): VoiceListener | null => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Speech Recognition not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event.error);
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop()
  };
};
