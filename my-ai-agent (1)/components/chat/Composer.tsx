import React, { useState, useRef, useEffect } from 'react';
import VoiceInput from '../shared/VoiceInput';
import clsx from 'clsx';
import { useLanguage } from '../../contexts/LanguageContext';

interface ComposerProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const Composer: React.FC<ComposerProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

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

  const hasInput = input.trim().length > 0;

  return (
    <div className="pt-2 pb-6 px-4 w-full z-10">
      <div className="max-w-3xl mx-auto">
        <form 
            onSubmit={handleSubmit} 
            className={clsx(
                "relative flex items-end bg-light-surface/80 dark:bg-[#2f2f2f]/80 backdrop-blur-xl rounded-[26px] shadow-xl border border-light-border dark:border-gray-600/50 focus-within:ring-1 focus-within:ring-accent-start/50 focus-within:border-accent-start/50 transition-all duration-300 ease-out",
                { "opacity-70": isLoading }
            )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            className="w-full max-h-[200px] bg-transparent text-light-text-primary dark:text-dark-text-primary rounded-[26px] py-3.5 pl-5 pr-24 resize-none focus:ring-0 focus:outline-none custom-scrollbar placeholder-light-text-secondary/70 dark:placeholder-dark-text-secondary/70 leading-relaxed font-medium"
            rows={1}
            style={{ minHeight: '52px' }}
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
              <VoiceInput 
                  onTranscriptChange={setInput}
                  currentValue={input}
                  disabled={isLoading}
                  className="hover:bg-light-bg/50 dark:hover:bg-[#424242] text-light-text-secondary dark:text-dark-text-secondary"
              />
              <button
                type="submit"
                disabled={isLoading || !hasInput}
                className={clsx(
                    "p-2 rounded-full flex items-center justify-center transition-all duration-300 mb-0.5",
                    (hasInput && !isLoading)
                        ? "bg-light-text-primary dark:bg-white text-white dark:text-black hover:opacity-90 shadow-md transform hover:scale-105 active:scale-95" 
                        : "bg-light-bg/50 dark:bg-[#424242] text-light-text-secondary dark:text-[#8e8ea0] cursor-not-allowed"
                )}
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
          </div>
        </form>
         <p className="text-xs text-center text-light-text-secondary dark:text-[#9ca3af] mt-3 animate-fade-in-up font-medium opacity-80">
            {t('chat.disclaimer')}
        </p>
      </div>
    </div>
  );
};

export default Composer;