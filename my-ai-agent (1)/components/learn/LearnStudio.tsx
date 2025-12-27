import React, { useState } from 'react';
import type { StudyPlan } from '../../types';
import { generateStudyPlan } from '../../services/geminiService';
import VoiceInput from '../shared/VoiceInput';
import { useLanguage } from '../../contexts/LanguageContext';

const LearnStudio: React.FC = () => {
    const { t } = useLanguage();
    const [topic, setTopic] = useState('');
    const [plan, setPlan] = useState<StudyPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please enter a topic to learn.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPlan(null);
        try {
            const response = await generateStudyPlan(topic);
            setPlan(response);
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
        <div className="max-w-4xl mx-auto h-full flex flex-col relative">
            <div className="flex-1 overflow-y-auto pr-0 md:pr-4 custom-scrollbar pb-24 md:pb-0">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary font-medium animate-pulse">{t('learn.planning')}</p>
                    </div>
                )}
                 {!isLoading && !plan && (
                     <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        {error ? (
                            <p className="text-red-500 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">{error}</p>
                        ) : (
                             <>
                                <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-full shadow-lg mb-6 border border-light-border dark:border-dark-border">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-accent-start" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" /></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-light-text-primary dark:text-dark-text-primary">{t('learn.title')}</h3>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-sm">
                                    {t('learn.desc')}
                                </p>
                             </>
                        )}
                    </div>
                )}
                {plan && (
                    <div className="space-y-6 md:pb-4">
                        <div className="bg-gradient-to-br from-accent-start to-accent-end p-6 rounded-2xl text-white shadow-lg">
                            <h2 className="text-3xl font-bold mb-2">{plan.learningTopic}</h2>
                            <div className="flex items-center gap-2 opacity-90">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="font-medium">{plan.durationWeeks} {t('learn.week_program')}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {plan.weeklyBreakdown?.map(week => (
                                <div key={week.week} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-accent-start/10 text-accent-start font-bold px-3 py-1 rounded-lg text-sm">
                                            Week {week.week}
                                        </div>
                                        <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary leading-tight">{week.title}</h3>
                                    </div>
                                    
                                    <div className="space-y-4 md:pl-2">
                                        {week.topics?.map((topicItem, index) => (
                                            <div key={index} className="relative pl-6 md:pl-8 border-l-2 border-light-border dark:border-dark-border py-1">
                                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-accent-start ring-4 ring-light-surface dark:ring-dark-surface"></div>
                                                <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary text-base">{topicItem.title}</h4>
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1 leading-relaxed">{topicItem.description}</p>
                                                {topicItem.resources?.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {topicItem.resources?.map((res, resIndex) => (
                                                            <a href={res.url} target="_blank" rel="noopener noreferrer" key={resIndex} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border border border-light-border dark:border-dark-border text-xs font-medium text-accent-start transition-colors">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                                {res.description || "Resource"}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Sticky Bottom Input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:relative md:p-0 md:mt-4 bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg md:bg-none z-10">
                <form onSubmit={handleSubmit} className="shadow-2xl md:shadow-none rounded-2xl">
                    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border p-2 flex flex-col sm:flex-row gap-2">
                         <div className="flex-grow flex items-center bg-light-bg dark:bg-dark-bg rounded-xl px-3 border border-transparent focus-within:border-accent-start focus-within:ring-1 focus-within:ring-accent-start transition-all">
                            <input
                                id="topic"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={t('learn.placeholder')}
                                className="flex-grow w-full bg-transparent text-light-text-primary dark:text-dark-text-primary p-3 focus:outline-none placeholder-light-text-secondary/60"
                                disabled={isLoading}
                            />
                            <VoiceInput
                                onTranscriptChange={setTopic}
                                currentValue={topic}
                                disabled={isLoading}
                                variant="minimal"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="shrink-0 w-full sm:w-auto bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                        >
                            {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                            {isLoading ? t('learn.planning') : t('learn.generate')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LearnStudio;