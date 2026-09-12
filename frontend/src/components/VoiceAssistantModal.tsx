import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Send, ArrowRight } from 'lucide-react';
import { speakText, stopSpeech, createSpeechRecognizer } from '../utils/speech';
import { useOffline } from '../context/OfflineContext';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { processAiQuery } from '../services/aiAssistantService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const { isOnline } = useOffline();
  const { language } = useAuth();
  const { patientProfile, familyMembers, routines, places, memories } = usePatient();

  const patientFirstName = patientProfile?.full_name?.split(' ')[0] || 'Friend';

  useEffect(() => {
    stopSpeech();
    setIsListening(false);
    setResponse(null);
    setTranscript('');
    setIsSpeaking(false);
  }, [isOpen, language]);

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setTranscript(queryText);
    setIsListening(false);

    try {
      const resData = await processAiQuery(queryText, {
        patientName: patientFirstName,
        patientAge: patientProfile?.age || 74,
        language,
        familyMembers,
        routines,
        places,
        memories
      });

      const replyText = resData.spoken_response || resData.text_response || '';
      setResponse(replyText);
      setIsSpeaking(true);
      speakText(replyText, language, () => {
        setIsSpeaking(false);
      });

      if (resData.suggested_screen && onNavigate) {
        setTimeout(() => {
          onClose();
          onNavigate(resData.suggested_screen!);
        }, 2800);
      }
    } catch (err) {
      const fallbackMsg = `I'm right here with you, ${patientFirstName}. How can I assist you today?`;
      setResponse(fallbackMsg);
      speakText(fallbackMsg, language, () => setIsSpeaking(false));
    }
  };

  const startListening = () => {
    setIsListening(true);
    setResponse(null);
    setTranscript('');

    const recognizer = createSpeechRecognizer(
      (text) => handleProcessQuery(text),
      () => setIsListening(false),
      language
    );

    if (recognizer) {
      recognizer.start();
    } else {
      setTimeout(() => {
        handleProcessQuery("Hello MANAS, what are we gonna do?");
      }, 2500);
    }
  };

  const stopListening = () => {
    stopSpeech();
    setIsListening(false);
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-teal-100 dark:border-slate-800 flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 mt-2">
          {isSpeaking ? <Volume2 className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
        </div>

        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
          {isListening ? 'Listening...' : isSpeaking ? 'MANAS is speaking' : 'Ask MANAS'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          {isListening
            ? 'Speak clearly into your microphone'
            : isSpeaking
            ? 'Listening to assistant response...'
            : 'Press the microphone and say something'}
        </p>

        {transcript && (
          <div className="w-full bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700/50">
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-1">You said:</span>
            <p className="text-slate-700 dark:text-slate-200 font-medium">"{transcript}"</p>
          </div>
        )}

        {response && (
          <div className="w-full bg-teal-50/50 dark:bg-teal-950/30 p-4 rounded-2xl mb-6 border border-teal-100 dark:border-teal-900/50">
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider block mb-1">MANAS:</span>
            <p className="text-slate-800 dark:text-slate-100 font-medium text-base leading-relaxed">{response}</p>
          </div>
        )}

        <div className="flex items-center gap-4 w-full mt-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 animate-pulse'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isListening ? 'Stop Listening' : 'Tap to Speak'}
          </button>
        </div>

        {/* Text Input Option */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typedInput.trim()) {
              handleProcessQuery(typedInput.trim());
              setTypedInput('');
            }
          }}
          className="flex items-center gap-2 w-full mt-3"
        >
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Or type a question or command..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={!typedInput.trim()}
            className="p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl transition-all"
            aria-label="Send query"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
