import React, { useState } from 'react';
import clsx from 'clsx';

interface ActionToolbarProps {
  contentToCopy: string;
  className?: string;
}

const ClipboardIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ThumbsUpIcon = ({ className = "h-5 w-5", filled = false }: { className?: string, filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12" />
    <path d="M17 10V4a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v6h-4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h8.59a2 2 0 0 0 1.95-1.57l1.4-7.43A2 2 0 0 0 17 10z" />
  </svg>
);

const ThumbsDownIcon = ({ className = "h-5 w-5", filled = false }: { className?: string, filled?: boolean }) => (
  <svg xmlns="http://www.w.org/2000/svg" className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 14V2" />
    <path d="M17 14v6a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-6h-4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8.59a2 2 0 0 1 1.95 1.57l1.4 7.43A2 2 0 0 1 17 14z" />
  </svg>
);


const ActionToolbar: React.FC<ActionToolbarProps> = ({ contentToCopy, className }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contentToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedback(prev => prev === 'like' ? null : 'like');
  }

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedback(prev => prev === 'dislike' ? null : 'dislike');
  }

  const baseButtonClass = 'p-1.5 rounded-md transition-colors text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg';

  return (
    <div className={clsx("flex items-center gap-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-1", className)}>
      <button onClick={handleCopy} className={baseButtonClass} title={copySuccess ? 'Copied!' : 'Copy'}>
        {copySuccess ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardIcon />}
      </button>
      <div className="w-px h-5 bg-light-border dark:bg-dark-border"></div>
      <button 
        onClick={handleLike} 
        className={clsx(baseButtonClass, {'text-accent-start dark:text-accent-start': feedback === 'like'})}
        title="Like"
      >
        <ThumbsUpIcon filled={feedback === 'like'} />
      </button>
      <button 
        onClick={handleDislike} 
        className={clsx(baseButtonClass, {'text-red-500 dark:text-red-500': feedback === 'dislike'})}
        title="Dislike"
      >
        <ThumbsDownIcon filled={feedback === 'dislike'} />
      </button>
    </div>
  );
};

export default ActionToolbar;