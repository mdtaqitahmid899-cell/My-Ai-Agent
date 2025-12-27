import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

interface VoiceInputProps {
  onTranscriptChange: (value: string) => void;
  currentValue: string;
  disabled: boolean;
  variant?: 'default' | 'minimal';
  className?: string;
}

// Fix: Add an interface for the SpeechRecognition instance to avoid name collisions and provide type safety.
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
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSupported = !!SpeechRecognition;

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptChange, currentValue, disabled, variant = 'default', className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (!isSupported) {
      return;
    }
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
      recognition.lang = localStorage.getItem('selected-language') || 'en-US';
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
                className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary cursor-not-allowed opacity-50"
                aria-label="Voice input not supported"
            >
                <MicrophoneIcon className="h-5 w-5" />
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-max bg-dark-bg dark:bg-light-bg text-dark-text-primary dark:text-light-text-primary text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Voice input not supported.
            </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleToggleRecording}
        disabled={disabled}
        className={clsx(
          "p-2 rounded-full transition-all duration-200 flex items-center justify-center",
          isRecording 
            ? 'bg-red-500 text-white animate-pulse shadow-md' 
            : className || 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-gray-700',
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        title={isRecording ? 'Stop recording' : 'Voice input'}
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