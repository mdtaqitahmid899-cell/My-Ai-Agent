import React, { useState } from 'react';
import type { WritingTone, WritingFormat, WritingLength } from '../../types';
import { generateLongFormText } from '../../services/geminiService';
import 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
import VoiceInput from '../shared/VoiceInput';
import ActionToolbar from '../shared/ActionToolbar';
import PromptEnhancerModal from './PromptEnhancerModal';
import CustomSelect from '../shared/CustomSelect';
import clsx from 'clsx';
import { useLanguage } from '../../contexts/LanguageContext';

declare var marked: {
  parse(markdown: string): string;
};

const SparklesIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.25a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06l-.25.25a.75.75 0 11-1.06-1.06l.25-.25a.75.75 0 011.06 0zm9.192 0a.75.75 0 011.06 0l.25.25a.75.75 0 11-1.06 1.06l-.25-.25a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h.25a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm15.25.75a.75.75 0 000-1.5h-.25a.75.75 0 000 1.5h.25zM5.404 15.657a.75.75 0 011.06 0l-.25.25a.75.75 0 11-1.06 1.06l.25-.25a.75.75 0 010-1.06zm9.192 0a.75.75 0 010 1.06l.25.25a.75.75 0 11-1.06 1.06l-.25-.25a.75.75 0 011.06 0zM10 18a.75.75 0 01.75-.75v-.25a.75.75 0 01-1.5 0v.25A.75.75 0 0110 18zM8.5 7.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM12.5 10.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM7.5 12.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
    </svg>
);

const WriteStudio: React.FC = () => {
    const { t } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState<WritingTone>('Professional');
    const [format, setFormat] = useState<WritingFormat>('Blog Post');
    const [length, setLength] = useState<WritingLength>('Medium (~300 words)');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);
    
    // Mobile Tab State
    const [mobileTab, setMobileTab] = useState<'compose' | 'result'>('compose');

    const tones: WritingTone[] = ['Professional', 'Casual', 'Persuasive', 'Informative', 'Creative'];
    const formats: WritingFormat[] = ['Blog Post', 'Email', 'Report', 'Social Media Post', 'Essay'];
    const lengths: WritingLength[] = ['Short (~100 words)', 'Medium (~300 words)', 'Long (~500+ words)'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult('');
        setMobileTab('result'); // Switch to result tab on mobile

        try {
            const stream = generateLongFormText(prompt, tone, format, length);
            for await (const chunk of stream) {
                setResult((prev) => prev + chunk);
            }
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

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                 {/* Mobile Tabs */}
                <div className="lg:hidden flex p-1 bg-light-surface dark:bg-dark-surface rounded-xl mb-4 shrink-0 border border-light-border dark:border-dark-border shadow-sm">
                    <button
                        onClick={() => setMobileTab('compose')}
                        className={clsx(
                            "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
                            mobileTab === 'compose' 
                                ? "bg-light-bg dark:bg-dark-bg text-accent-start shadow-sm" 
                                : "text-light-text-secondary dark:text-dark-text-secondary"
                        )}
                    >
                        {t('write.compose')}
                    </button>
                    <button
                        onClick={() => setMobileTab('result')}
                        className={clsx(
                            "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
                            mobileTab === 'result' 
                                ? "bg-light-bg dark:bg-dark-bg text-accent-start shadow-sm" 
                                : "text-light-text-secondary dark:text-dark-text-secondary"
                        )}
                    >
                        {t('write.result')}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden">
                    {/* Controls Panel */}
                    <div className={clsx(
                        "lg:w-1/3 bg-light-surface dark:bg-dark-surface p-6 rounded-lg flex flex-col border border-light-border dark:border-dark-border lg:flex h-full lg:overflow-y-auto custom-scrollbar",
                        mobileTab === 'compose' ? 'flex overflow-y-auto' : 'hidden'
                    )}>
                        <form onSubmit={handleSubmit} className="flex flex-col flex-grow space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="prompt" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                        {t('write.prompt_label')}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEnhancerOpen(true)}
                                            className="p-1.5 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                                            title="Enhance Prompt"
                                        >
                                            <SparklesIcon className="h-5 w-5" />
                                        </button>
                                        <VoiceInput 
                                            onTranscriptChange={setPrompt}
                                            currentValue={prompt}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., An email to my team about the new quarterly goals."
                                    className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border"
                                    rows={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">{t('write.tone')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {tones.map(t => (
                                        <button type="button" key={t} onClick={() => setTone(t)} className={`p-2 rounded-md text-sm transition-colors ${tone === t ? 'bg-gradient-to-r from-accent-start to-accent-end text-white shadow' : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <CustomSelect
                                label={t('write.format')}
                                value={format}
                                onChange={(val) => setFormat(val as WritingFormat)}
                                options={formats}
                            />
                            
                            <CustomSelect
                                label={t('write.length')}
                                value={length}
                                onChange={(val) => setLength(val as WritingLength)}
                                options={lengths}
                            />

                            <div className="mt-auto pt-4">
                                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3.5 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center shadow-lg shadow-accent-start/20">
                                    {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                                    {isLoading ? t('write.writing') : t('write.generate')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Output Panel */}
                    <div className={clsx(
                        "lg:w-2/3 bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border h-full lg:flex flex-col relative",
                        mobileTab === 'result' ? 'flex' : 'hidden'
                    )}>
                        {isLoading && !result && (
                            <div className="m-auto text-center">
                                <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary animate-pulse">{t('write.writing')}</p>
                            </div>
                        )}
                        {error && <div className="m-auto text-center text-red-400"><p>{error}</p></div>}
                        
                        {!isLoading && !result && !error && (
                            <div className="m-auto text-center text-light-text-secondary dark:text-dark-text-secondary opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                <p className="mt-2 text-sm">{t('write.empty')}</p>
                                <button 
                                    onClick={() => setMobileTab('compose')}
                                    className="lg:hidden mt-4 text-accent-start font-medium underline"
                                >
                                    {t('write.compose')}
                                </button>
                            </div>
                        )}
                        
                        {result && (
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex justify-end mb-4 shrink-0">
                                    <ActionToolbar contentToCopy={result} />
                                </div>
                                <div className="prose dark:prose-invert max-w-none flex-1 overflow-y-auto custom-scrollbar pr-2" dangerouslySetInnerHTML={{ __html: marked.parse(result) }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <PromptEnhancerModal
                isOpen={isEnhancerOpen}
                onClose={() => setIsEnhancerOpen(false)}
                onUsePrompt={(newPrompt) => {
                    setPrompt(newPrompt);
                    setIsEnhancerOpen(false);
                }}
            />
        </>
    );
};

export default WriteStudio;