import React, { useState } from 'react';
import type { ResearchResult } from '../../types';
import { performDeepResearch } from '../../services/geminiService';
import 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
import VoiceInput from '../shared/VoiceInput';
import ActionToolbar from '../shared/ActionToolbar';
import { useLanguage } from '../../contexts/LanguageContext';

declare var marked: {
  parse(markdown: string): string;
};

const ResearchStudio: React.FC = () => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<ResearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await performDeepResearch(query);
            setResult(response);
        } catch (err) {
            const errorMessage = (err as Error)?.message || 'An unknown error occurred.';
            if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                setError('You have exceeded your API quota. Please check your plan and billing details on ai.google.dev.');
            } else {
                setError('An unexpected error occurred during research.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col relative">
            <div className="flex-1 overflow-y-auto pr-0 md:pr-4 custom-scrollbar pb-24 md:pb-0">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary animate-pulse">{t('research.searching')}</p>
                    </div>
                )}

                {!isLoading && !result && (
                     <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        {error ? (
                            <div className="bg-red-100 dark:bg-red-900/20 text-red-500 p-4 rounded-lg">
                                <p>{error}</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-full shadow-lg mb-6 border border-light-border dark:border-dark-border">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-accent-start" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-light-text-primary dark:text-dark-text-primary">{t('research.title')}</h3>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-sm">
                                    {t('research.desc')}
                                </p>
                            </>
                        )}
                    </div>
                )}

                {result && (
                    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-4 md:p-8 rounded-2xl shadow-sm mb-4">
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-light-border dark:border-dark-border">
                            <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{t('research.summary')}</h3>
                            <ActionToolbar contentToCopy={result.summary} />
                        </div>
                        <div className="prose prose-lg dark:prose-invert max-w-none prose-a:text-accent-start" dangerouslySetInnerHTML={{ __html: marked.parse(result.summary) }} />

                        {result.sources.length > 0 && (
                            <div className="mt-10 pt-6 border-t border-light-border dark:border-dark-border">
                                <h4 className="font-bold text-lg mb-4 text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-start" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                    </svg>
                                    {t('research.sources')}
                                </h4>
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {result.sources.map((source, index) => (
                                        <li key={index}>
                                            <a 
                                                href={source.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center gap-3 p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50 hover:bg-light-bg dark:hover:bg-dark-bg hover:border-accent-start transition-all group h-full"
                                            >
                                                <div className="bg-light-surface dark:bg-dark-surface p-2 rounded-md shadow-sm group-hover:shadow-md transition-shadow shrink-0">
                                                    <span className="text-accent-start font-bold text-xs">{index + 1}</span>
                                                </div>
                                                <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary line-clamp-2 group-hover:text-accent-start transition-colors">
                                                    {source.title || source.uri}
                                                </span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-light-text-secondary dark:text-dark-text-secondary group-hover:text-accent-start shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sticky Input Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:relative md:p-0 md:mt-4 bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg md:bg-none z-10">
                <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto shadow-2xl md:shadow-none rounded-2xl">
                    <div className="relative flex items-center bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border focus-within:ring-2 focus-within:ring-accent-start transition-all">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('research.placeholder')}
                            className="w-full bg-transparent text-light-text-primary dark:text-dark-text-primary rounded-2xl py-4 pl-4 pr-32 focus:outline-none"
                            disabled={isLoading}
                        />
                         <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <VoiceInput
                                onTranscriptChange={setQuery}
                                currentValue={query}
                                disabled={isLoading}
                                className="hover:bg-light-bg dark:hover:bg-dark-bg"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !query.trim()} 
                                className="p-2.5 rounded-xl bg-gradient-to-r from-accent-start to-accent-end text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResearchStudio;