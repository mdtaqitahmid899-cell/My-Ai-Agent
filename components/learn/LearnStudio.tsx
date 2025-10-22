import React, { useState } from 'react';
import type { StudyPlan } from '../../types';
import { generateStudyPlan } from '../../services/geminiService';
import VoiceInput from '../shared/VoiceInput';

const LearnStudio: React.FC = () => {
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
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">Generating your personalized study plan...</p>
                    </div>
                )}
                 {!isLoading && !plan && (
                     <div className="flex flex-col items-center justify-center h-full text-center">
                        {error ? (
                            <p className="text-red-400">{error}</p>
                        ) : (
                             <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" /></svg>
                                <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">Your study plan will appear here.</p>
                             </>
                        )}
                    </div>
                )}
                {plan && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">Study Plan: <span className="text-accent-start">{plan.learningTopic}</span></h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">A {plan.durationWeeks}-week guide to mastering your topic.</p>
                        {plan.weeklyBreakdown.map(week => (
                            <div key={week.week} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-6 rounded-lg">
                                <h3 className="text-xl font-bold text-accent-start mb-4">Week {week.week}: {week.title}</h3>
                                <div className="space-y-4">
                                    {week.topics.map((topicItem, index) => (
                                        <div key={index} className="border-l-4 border-light-border dark:border-dark-border pl-4">
                                            <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary">{topicItem.title}</h4>
                                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1">{topicItem.description}</p>
                                            {topicItem.resources.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {topicItem.resources.map((res, resIndex) => (
                                                        <a href={res.url} target="_blank" rel="noopener noreferrer" key={resIndex} className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                            <span>{res.description}</span>
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
                )}
            </div>
            
            <div className="pt-4 mt-4 border-t border-light-border dark:border-dark-border">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="topic" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">What do you want to learn?</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow flex items-center bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border focus-within:ring-2 focus-within:ring-accent-start transition-shadow pr-2">
                            <input
                                id="topic"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Quantum Computing for beginners"
                                className="flex-grow w-full bg-transparent text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:outline-none"
                                disabled={isLoading}
                            />
                            <VoiceInput
                                onTranscriptChange={setTopic}
                                currentValue={topic}
                                disabled={isLoading}
                                variant="minimal"
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="shrink-0 w-full sm:w-auto bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:from-light-text-secondary disabled:to-light-text-secondary dark:disabled:from-dark-text-secondary dark:disabled:to-dark-text-secondary disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                            {isLoading ? 'Planning...' : 'Generate Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LearnStudio;