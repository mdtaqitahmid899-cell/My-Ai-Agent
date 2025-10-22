import React, { useState, useRef, useEffect } from 'react';
import VoiceInput from '../shared/VoiceInput';

interface ComposerProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const Composer: React.FC<ComposerProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      const scrollHeight = textarea.scrollHeight;
      // Set a max height (e.g., 200px)
      const maxHeight = 200;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [input]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="pt-4 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Ask anything...'
            className="w-full bg-transparent text-light-text-primary dark:text-dark-text-primary rounded-2xl p-4 pr-36 resize-none focus:ring-0 focus:outline-none transition"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <VoiceInput 
                  onTranscriptChange={setInput}
                  currentValue={input}
                  disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-full bg-gradient-to-br from-accent-start to-accent-end text-white disabled:from-light-text-secondary disabled:to-light-text-secondary dark:disabled:from-dark-text-secondary dark:disabled:to-dark-text-secondary disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </button>
          </div>
        </form>
         <p className="text-xs text-center text-light-text-secondary dark:text-dark-text-secondary mt-2 px-4">
            My-AI Agent can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default Composer;