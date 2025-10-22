import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { enhancePrompt } from '../../services/geminiService';

interface PromptEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt: (prompt: string) => void;
}

const PromptEnhancerModal: React.FC<PromptEnhancerModalProps> = ({ isOpen, onClose, onUsePrompt }) => {
  const [initialPrompt, setInitialPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!initialPrompt.trim()) {
      setError('Please enter a topic or idea.');
      return;
    }
    setIsLoading(true);
    setError('');
    setEnhancedPrompt('');
    try {
      const result = await enhancePrompt(initialPrompt);
      setEnhancedPrompt(result);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'An unknown error occurred.';
      if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          setError('You have exceeded your API quota. Please check your plan and billing details on ai.google.dev.');
      } else {
          setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsePrompt = () => {
    if (enhancedPrompt) {
      onUsePrompt(enhancedPrompt);
      handleClose();
    }
  };
  
  const handleClose = () => {
      setInitialPrompt('');
      setEnhancedPrompt('');
      setError('');
      setIsLoading(false);
      onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Prompt Enhancer ✨"
      footer={
        <div className="flex items-center gap-4">
          <button 
            onClick={handleClose} 
            className="px-4 py-2 text-sm font-medium rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleUsePrompt}
            disabled={!enhancedPrompt || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-accent-start to-accent-end rounded-md hover:opacity-90 transition-opacity disabled:from-light-text-secondary disabled:to-light-text-secondary dark:disabled:from-dark-text-secondary dark:disabled:to-dark-text-secondary disabled:cursor-not-allowed"
          >
            Use This Prompt
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="initial-prompt" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Enter a simple topic or idea
          </label>
          <textarea
            id="initial-prompt"
            value={initialPrompt}
            onChange={(e) => setInitialPrompt(e.target.value)}
            placeholder="e.g., Explain black holes to a 5-year-old"
            className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border"
            rows={3}
          />
        </div>
        
        <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-accent-start/10 text-accent-start font-bold py-3 px-4 rounded-lg hover:bg-accent-start/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
            {isLoading && <div className="w-5 h-5 border-2 border-accent-start border-t-transparent rounded-full animate-spin mr-2"></div>}
            {isLoading ? 'Enhancing...' : 'Generate Enhanced Prompt'}
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}
        
        {(isLoading && !enhancedPrompt) && (
            <div className="text-center p-8">
                <div className="w-8 h-8 border-2 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">The AI is thinking...</p>
            </div>
        )}

        {enhancedPrompt && (
            <div>
                 <label htmlFor="enhanced-prompt" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    AI-Generated Prompt
                </label>
                <textarea
                    id="enhanced-prompt"
                    value={enhancedPrompt}
                    readOnly
                    className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border font-mono text-sm"
                    rows={10}
                />
            </div>
        )}
      </div>
    </Modal>
  );
};

export default PromptEnhancerModal;