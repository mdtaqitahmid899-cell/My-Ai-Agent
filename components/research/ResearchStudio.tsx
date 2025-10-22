import React, { useState } from 'react';
import type { ResearchResult } from '../../types';
import { performDeepResearch } from '../../services/geminiService';
import 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
import VoiceInput from '../shared/VoiceInput';
import ActionToolbar from '../shared/ActionToolbar';

declare var marked: {
  parse(markdown: string): string;
};

const ResearchStudio: React.FC = () => {
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
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">Searching the web...</p>
                    </div>
                )}

                {!isLoading && !result && (
                     <div className="flex flex-col items-center justify-center h-full text-center">
                        {error ? (
                            <p className="text-red-400">{error}</p>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">Ask a question to start your research.</p>
                            </>
                        )}
                    </div>
                )}

                {result && (
                    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-6 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Research Summary</h3>
                            <ActionToolbar contentToCopy={result.summary} />
                        </div>
                        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(result.summary) }} />

                        {result.sources.length > 0 && (
                            <div className="mt-8">
                                <h4 className="font-bold text-lg mb-3 text-light-text-primary dark:text-dark-text-primary">Sources</h4>
                                <ul className="space-y-2">
                                    {result.sources.map((source, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="text-accent-start mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                            </span>
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-accent-start hover:underline break-all">
                                                {source.title || source.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="pt-4 mt-4 border-t border-light-border dark:border-dark-border">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary rounded-lg p-4 pr-36 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border"
                        disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <VoiceInput
                            onTranscriptChange={setQuery}
                            currentValue={query}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !query.trim()} className="p-2 rounded-full bg-gradient-to-r from-accent-start to-accent-end text-white disabled:from-light-text-secondary disabled:to-light-text-secondary dark:disabled:from-dark-text-secondary dark:disabled:to-dark-text-secondary disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResearchStudio;