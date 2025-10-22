import React, { useState } from 'react';
import type { WritingTone, WritingFormat, WritingLength } from '../../types';
import { generateLongFormText } from '../../services/geminiService';
import 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
import VoiceInput from '../shared/VoiceInput';
import ActionToolbar from '../shared/ActionToolbar';

declare var marked: {
  parse(markdown: string): string;
};

const WriteStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState<WritingTone>('Professional');
    const [format, setFormat] = useState<WritingFormat>('Blog Post');
    const [length, setLength] = useState<WritingLength>('Medium (~300 words)');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
        <div className="flex flex-col lg:flex-row gap-8 h-full">
            {/* Controls Panel */}
            <div className="lg:w-1/3 bg-light-surface dark:bg-dark-surface p-6 rounded-lg flex flex-col border border-light-border dark:border-dark-border">
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="prompt" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                What do you want to write about?
                            </label>
                            <VoiceInput 
                                onTranscriptChange={setPrompt}
                                currentValue={prompt}
                                disabled={isLoading}
                            />
                        </div>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., An email to my team about the new quarterly goals."
                            className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border"
                            rows={4}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Tone</label>
                        <div className="grid grid-cols-3 gap-2">
                            {tones.map(t => (
                                <button type="button" key={t} onClick={() => setTone(t)} className={`p-2 rounded-md text-sm transition-colors ${tone === t ? 'bg-gradient-to-r from-accent-start to-accent-end text-white shadow' : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Format</label>
                         <select value={format} onChange={(e) => setFormat(e.target.value as WritingFormat)} className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border">
                            {formats.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Length</label>
                         <select value={length} onChange={(e) => setLength(e.target.value as WritingLength)} className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border">
                            {lengths.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <div className="mt-auto pt-4">
                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:from-light-text-secondary disabled:to-light-text-secondary dark:disabled:from-dark-text-secondary dark:disabled:to-dark-text-secondary disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                            {isLoading ? 'Writing...' : 'Generate Text'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Output Panel */}
            <div className="lg:w-2/3 bg-light-surface dark:bg-dark-surface p-6 rounded-lg flex flex-col border border-light-border dark:border-dark-border min-h-[400px] lg:min-h-0">
                 {isLoading && !result && (
                    <div className="m-auto text-center">
                        <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">The AI is writing...</p>
                    </div>
                )}
                {error && <div className="m-auto text-center text-red-400"><p>{error}</p></div>}
                
                {!isLoading && !result && !error && (
                    <div className="m-auto text-center text-light-text-secondary dark:text-dark-text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        <p className="mt-2">Your generated text will appear here.</p>
                    </div>
                )}
                
                {result && (
                    <>
                        <div className="flex justify-end mb-4">
                            <ActionToolbar contentToCopy={result} />
                        </div>
                        <div className="prose dark:prose-invert max-w-none flex-1 overflow-y-auto" dangerouslySetInnerHTML={{ __html: marked.parse(result) }} />
                    </>
                )}
            </div>
        </div>
    );
};

export default WriteStudio;