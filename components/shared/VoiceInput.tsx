import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES } from '../../constants';
import type { Language } from '../../types';
import clsx from 'clsx';

interface VoiceInputProps {
  onTranscriptChange: (value: string) => void;
  currentValue: string;
  disabled: boolean;
  variant?: 'default' | 'minimal';
}

// Fix: Add an interface for the SpeechRecognition instance to avoid name collisions and provide type safety.
// The SpeechRecognition API is not part of the standard DOM typings.
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

// Check for SpeechRecognition API
// Fix: Cast window to `any` to access non-standard browser APIs without TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSupported = !!SpeechRecognition;

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptChange, currentValue, disabled, variant = 'default' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  // Fix: Use the custom SpeechRecognitionInstance interface for the ref type to resolve the name collision.
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (!isSupported) {
      return;
    }
    // Cleanup function to stop recognition if component unmounts
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (!isSupported) {
        alert("Voice recognition is not supported in your browser.");
        return;
      }
      
      const recognition: SpeechRecognitionInstance = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = selectedLang;
      recognition.interimResults = true;
      recognition.continuous = true;

      let finalTranscript = currentValue;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += ' ' + event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        onTranscriptChange((finalTranscript + ' ' + interimTranscript).trim());
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert("Microphone access was denied. Please allow microphone access in your browser settings to use voice input.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        onTranscriptChange(finalTranscript.trim());
      };

      recognition.start();
      setIsRecording(true);
    }
  };

  if (!isSupported) {
    return (
        <div className="group relative">
            <button
                type="button"
                disabled
                className="p-2 rounded-full text-white bg-light-text-secondary dark:bg-dark-text-secondary cursor-not-allowed"
                aria-label="Voice input not supported"
            >
                <MicrophoneIcon className="h-5 w-5" />
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-max bg-dark-bg dark:bg-light-bg text-dark-text-primary dark:text-light-text-primary text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Voice input not supported.
            </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
        disabled={isRecording || disabled}
        className={clsx(
            "text-light-text-secondary dark:text-dark-text-secondary text-xs rounded-md p-1 focus:ring-2 focus:ring-accent-start focus:outline-none transition appearance-none",
            variant === 'default' && "bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border",
            variant === 'minimal' && "bg-transparent border-none"
        )}
        style={{
            paddingRight: '1.5rem',
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.25rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.25em'
        }}
        aria-label="Select language for voice input"
      >
        {LANGUAGES.map((lang: Language) => (
          <option key={lang.code} value={lang.code}>
            {lang.code.split('-')[0].toUpperCase()}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleToggleRecording}
        disabled={disabled}
        className={`p-2 rounded-full text-white transition-opacity ${
          isRecording ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-accent-start to-accent-end hover:opacity-90'
        } disabled:from-light-text-secondary disabled:to-light-text-secondary dark:disabled:from-dark-text-secondary dark:disabled:to-dark-text-secondary disabled:cursor-not-allowed`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <MicrophoneIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
  </svg>
);

export default VoiceInput;