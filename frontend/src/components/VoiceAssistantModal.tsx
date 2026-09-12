import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Send, ArrowRight } from 'lucide-react';
import { speakText, stopSpeech, createSpeechRecognizer } from '../utils/speech';
import { fetchApi } from '../utils/api';
import { useOffline } from '../context/OfflineContext';
import { useAuth } from '../context/AuthContext';

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
  const { isOnline } = useOffline();
  const { language } = useAuth();

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
      let resData: any;
      if (isOnline) {
        resData = await fetchApi('/voice/ask', {
          method: 'POST',
          body: { transcript: queryText, language: language }
        });
      } else {
        const q = queryText.toLowerCase().trim();
        if (q.includes('hello') || q.startsWith('hi')) {
          resData = {
            spoken_response: "Hello! It's nice to hear from you. How are you feeling today?",
            action: "NONE"
          };
        } else if (q.includes('what are we gonna do') || q.includes('what can we do') || q.includes('what should we do')) {
          resData = {
            spoken_response: "We could play a memory game, look through some family memories, or check what you have planned for today. What would you like to do?",
            action: "OFFER_CHOICES",
            suggested_screen: "/games"
          };
        } else if (q.includes('bored')) {
          resData = {
            spoken_response: "Let's do something enjoyable. We could play a quick memory game or look at some special memories. Which sounds better?",
            action: "OFFER_CHOICES",
            suggested_screen: "/games"
          };
        } else if (q.includes('today') || q.includes('schedule') || q.includes('reminder')) {
          resData = {
            spoken_response: "Here is your plan for today: 07:30 AM Tea & Breathing, 08:00 AM Blood Pressure Medicine, 10:00 AM Cognitive Training Activity.",
            action: "NAVIGATE_TODAY",
            suggested_screen: "/today"
          };
        } else if (q.includes('arun') || q.includes('who is arun')) {
          resData = {
            spoken_response: "Arun is your 14-year-old grandson. He plays guitar and loves visiting Shillong.",
            action: "SHOW_PERSON",
            suggested_screen: "/people"
          };
        } else if (q.includes('hospital') || q.includes('where is my hospital')) {
          resData = {
            spoken_response: "Your hospital is Shillong Medical Centre, located at Laitumkhrah.",
            action: "SHOW_PLACE_ROUTE",
            suggested_screen: "/places"
          };
        } else if (q.includes('game') || q.includes('play')) {
          resData = {
            spoken_response: "Sure! Would you like to try a memory game or an attention game?",
            action: "NAVIGATE_GAMES",
            suggested_screen: "/games"
          };
        } else if (q.includes('thank you')) {
          resData = {
            spoken_response: "You're very welcome. I'm always happy to help.",
            action: "NONE"
          };
        } else {
          resData = {
            spoken_response: "I'm not quite sure what you mean. You can ask me about today's activities, your reminders, your memories, your family, or we can play a game.",
            action: "HELP_GUIDANCE"
          };
        }
      }

      setResponse(resData.spoken_response);
      setIsSpeaking(true);
      speakText(resData.spoken_response, language, () => {
        setIsSpeaking(false);
      });

      if (resData.suggested_screen && onNavigate) {
        setTimeout(() => {
          onClose();
          onNavigate(resData.suggested_screen);
        }, 3200);
      }
    } catch (err) {
      const fallbackMsg = "I'm not quite sure what you mean. You can ask me about today's activities, your reminders, your memories, your family, or we can play a game.";
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
      </div>
    </div>
  );
};
