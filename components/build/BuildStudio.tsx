import React, { useState, useEffect, useMemo } from 'react';
import type { CodeLanguage } from '../../types';
import { generateCode } from '../../services/geminiService';
import VoiceInput from '../shared/VoiceInput';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-typescript';


const BuildStudio: React.FC = () => {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<CodeLanguage>('HTML/CSS');
  const [existingCode, setExistingCode] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fix: Renamed `languages` to `languageOptions` to avoid a name collision with the `languages` object imported from `prismjs`.
  const languageOptions: CodeLanguage[] = ['HTML/CSS', 'JavaScript', 'Python', 'TypeScript', 'SQL'];

  const generatedCode = useMemo(() => {
    // Extract code from the first markdown block
    const match = result.match(/```(?:\w+\n)?([\s\S]*?)```/);
    return match ? match[1] : result; // Fallback to result if no markdown block
  }, [result]);

  // Effect to manage the live preview URL for HTML/CSS, ensuring proper cleanup to prevent memory leaks.
  useEffect(() => {
    if (language === 'HTML/CSS' && generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const newUrl = URL.createObjectURL(blob);
      setPreviewUrl(newUrl);

      // The cleanup function runs when dependencies change or the component unmounts.
      // It revokes the URL to release it from memory, preventing leaks.
      return () => {
        URL.revokeObjectURL(newUrl);
      };
    } else {
      // Explicitly clear the preview if the language is not HTML/CSS or there is no code.
      setPreviewUrl(null);
    }
  }, [generatedCode, language]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    if (mode === 'edit' && !existingCode.trim()) {
      setError('Please provide the code you want to edit.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const stream = generateCode(prompt, language, mode === 'edit' ? existingCode : undefined);
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

  const handleCopy = () => {
    if(generatedCode) {
        navigator.clipboard.writeText(generatedCode).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    }
  };
  
  const mapLanguageToPrism = (lang: CodeLanguage): string => {
      switch (lang) {
          case 'HTML/CSS': return 'markup';
          case 'JavaScript': return 'javascript';
          case 'Python': return 'python';
          case 'TypeScript': return 'typescript';
          case 'SQL': return 'sql';
          default: return 'clike';
      }
  };

  const prismLang = mapLanguageToPrism(language);
  const codeHighlighter = (code: string) => Prism.highlight(code, Prism.languages[prismLang] || Prism.languages.clike, prismLang);

  const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors w-full ${
        active ? 'bg-gradient-to-r from-accent-start to-accent-end text-white shadow' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg'
      }`}
    >
      {children}
    </button>
  );

  const ClipboardIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
  const CheckIcon = ({ className = "h-5 w-5" }) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
  );
  
  const ExternalLinkIcon = ({ className = "h-4 w-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  return (
    <div className="h-full flex flex-col">
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-6 rounded-lg mb-8">
             <div className="flex items-center gap-2 mb-4 p-1 rounded-lg bg-light-bg dark:bg-dark-bg max-w-sm">
                <TabButton active={mode === 'generate'} onClick={() => setMode('generate')}>Generate Code</TabButton>
                <TabButton active={mode === 'edit'} onClick={() => setMode('edit')}>Edit Code</TabButton>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                 {mode === 'edit' && (
                  <div>
                    <label htmlFor="existingCode" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Code to Edit</label>
                    <Editor
                        value={existingCode}
                        onValueChange={code => setExistingCode(code)}
                        highlight={codeHighlighter}
                        padding={10}
                        className="code-editor"
                    />
                  </div>
                )}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="prompt" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                            {mode === 'generate' ? 'What do you want to build?' : 'How should I change the code?'}
                        </label>
                        <VoiceInput 
                            onTranscriptChange={setPrompt}
                            currentValue={prompt}
                            disabled={isLoading}
                        />
                    </div>
                    <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={mode === 'generate' ? "e.g., A responsive portfolio landing page with a contact form" : "e.g., Change the primary color to green"} className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border" rows={mode === 'generate' ? 3 : 2}/>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="language" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Language</label>
                        <select id="language" value={language} onChange={(e) => setLanguage(e.target.value as CodeLanguage)} className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border">
                            {languageOptions.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="flex-shrink-0 self-end">
                        <button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:from-light-text-secondary disabled:to-light-text-secondary dark:disabled:from-dark-text-secondary dark:disabled:to-dark-text-secondary disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                            {isLoading ? (mode === 'generate' ? 'Building...' : 'Editing...') : (mode === 'generate' ? 'Generate Code' : 'Edit Code')}
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
            {/* Code Panel */}
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg flex flex-col min-h-[400px] lg:min-h-0 relative">
                {isLoading && !result && (
                    <div className="absolute inset-0 bg-light-surface/80 dark:bg-dark-surface/80 flex items-center justify-center rounded-lg z-10">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">Generating code...</p>
                        </div>
                    </div>
                )}
                {error && <div className="m-auto text-center text-red-400"><p>{error}</p></div>}
                {!isLoading && !result && !error && (
                    <div className="m-auto text-center text-light-text-secondary dark:text-dark-text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        <p className="mt-2">Your generated code will appear here.</p>
                    </div>
                )}
                {result && (
                    <>
                        <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{language} Code</p>
                            <button onClick={handleCopy} className="p-2 rounded-lg bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary transition-colors flex items-center gap-2" aria-label="Copy code">
                                {copySuccess ? <CheckIcon /> : <ClipboardIcon />}
                                <span className="text-sm">{copySuccess ? 'Copied!' : 'Copy'}</span>
                            </button>
                        </div>
                        <div className="code-output flex-1 overflow-auto">
                            <Editor
                                value={generatedCode}
                                onValueChange={() => {}}
                                highlight={codeHighlighter}
                                readOnly
                                padding={0}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Webview Panel */}
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg flex flex-col min-h-[400px] lg:min-h-0">
                <div className="p-4 border-b border-light-border dark:border-dark-border flex-shrink-0 flex justify-between items-center">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Live Preview</p>
                     {language === 'HTML/CSS' && previewUrl && (
                        <button
                            onClick={() => window.open(previewUrl, '_blank')}
                            className="flex items-center gap-2 py-1 px-2.5 text-xs rounded-md bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary transition-colors"
                            aria-label="Open preview in new tab"
                        >
                            <ExternalLinkIcon className="h-4 w-4" />
                            <span>Open in New Tab</span>
                        </button>
                    )}
                </div>
                <div className="flex-1 p-4 bg-white relative">
                  {language === 'HTML/CSS' && previewUrl ? (
                     <iframe
                        src={previewUrl}
                        title="Live Preview"
                        className="w-full h-full border-0 rounded-b-lg"
                        sandbox="allow-scripts allow-same-origin"
                     />
                  ) : (
                     <div className="flex items-center justify-center h-full text-center text-light-text-secondary bg-light-bg dark:bg-dark-bg dark:text-dark-text-secondary rounded-b-lg">
                        <div>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                           <p className="mt-2 text-sm">Live preview is only available for HTML/CSS.</p>
                        </div>
                     </div>
                  )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default BuildStudio;