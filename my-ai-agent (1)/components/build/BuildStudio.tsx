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
import CustomSelect from '../shared/CustomSelect';
import clsx from 'clsx';
import { useLanguage } from '../../contexts/LanguageContext';

const BuildStudio: React.FC = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<CodeLanguage>('HTML/CSS');
  const [existingCode, setExistingCode] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // View States
  const [mobileTab, setMobileTab] = useState<'build' | 'code' | 'preview'>('build');
  const [desktopView, setDesktopView] = useState<'code' | 'preview' | 'split'>('split');

  const languageOptions: CodeLanguage[] = ['HTML/CSS', 'JavaScript', 'Python', 'TypeScript', 'SQL'];

  const generatedCode = useMemo(() => {
    // Extract code from the first markdown block
    const match = result.match(/```(?:\w+\n)?([\s\S]*?)```/);
    return match ? match[1] : result; // Fallback to result if no markdown block
  }, [result]);

  useEffect(() => {
    if (language === 'HTML/CSS' && generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const newUrl = URL.createObjectURL(blob);
      setPreviewUrl(newUrl);
      return () => {
        URL.revokeObjectURL(newUrl);
      };
    } else {
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
    
    // Auto-switch views based on context
    if (language === 'HTML/CSS') {
        setMobileTab('preview');
        // On desktop, split view is usually best for HTML, so we keep 'split' or switch to it if needed
    } else {
        setMobileTab('code');
        if (desktopView === 'preview') setDesktopView('code'); // Switch away from preview if not HTML
    }

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

  const handleLoadGenerated = () => {
    if (generatedCode) {
        setExistingCode(generatedCode);
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

  const ViewToggleIcon = ({ mode, current }: { mode: 'code' | 'preview' | 'split', current: string }) => {
      const active = mode === current;
      return (
          <div className={clsx("flex items-center gap-2", active ? "text-accent-start" : "text-light-text-secondary dark:text-dark-text-secondary")}>
              {mode === 'code' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              )}
              {mode === 'preview' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
              {mode === 'split' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
              )}
          </div>
      )
  }

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
    <div className="h-full flex flex-col overflow-hidden">
        {/* Mobile Tabs */}
        <div className="lg:hidden flex p-1 bg-light-surface dark:bg-dark-surface rounded-xl mb-4 shrink-0 border border-light-border dark:border-dark-border shadow-sm">
            <button onClick={() => setMobileTab('build')} className={clsx("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", mobileTab === 'build' ? "bg-light-bg dark:bg-dark-bg text-accent-start shadow-sm" : "text-light-text-secondary dark:text-dark-text-secondary")}>
                {t('build.tab.build')}
            </button>
            <button onClick={() => setMobileTab('code')} className={clsx("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", mobileTab === 'code' ? "bg-light-bg dark:bg-dark-bg text-accent-start shadow-sm" : "text-light-text-secondary dark:text-dark-text-secondary")}>
                {t('build.tab.code')}
            </button>
            <button onClick={() => setMobileTab('preview')} className={clsx("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", mobileTab === 'preview' ? "bg-light-bg dark:bg-dark-bg text-accent-start shadow-sm" : "text-light-text-secondary dark:text-dark-text-secondary")}>
                {t('build.tab.preview')}
            </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden relative">
             {/* Left Column: Build Config (Sidebar on Desktop) */}
             <div className={clsx(
                 "lg:w-96 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-6 rounded-lg flex-shrink-0 flex flex-col h-full overflow-y-auto custom-scrollbar",
                 mobileTab === 'build' ? 'flex' : 'hidden lg:flex'
             )}>
                <div className="flex items-center gap-2 mb-6 p-1 rounded-lg bg-light-bg dark:bg-dark-bg shrink-0">
                    <TabButton active={mode === 'generate'} onClick={() => setMode('generate')}>{t('build.mode.generate')}</TabButton>
                    <TabButton active={mode === 'edit'} onClick={() => setMode('edit')}>{t('build.mode.edit')}</TabButton>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                        {mode === 'edit' && (
                        <div>
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="existingCode" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{t('build.code_to_edit')}</label>
                             {generatedCode && (
                                <button 
                                    type="button" 
                                    onClick={handleLoadGenerated}
                                    className="text-xs flex items-center gap-1 text-accent-start hover:text-accent-end transition-colors font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.25a1 1 0 11-2 0V13.003a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                    {t('build.load_generated')}
                                </button>
                             )}
                        </div>
                        <Editor
                            value={existingCode}
                            onValueChange={code => setExistingCode(code)}
                            highlight={codeHighlighter}
                            padding={10}
                            className="code-editor max-h-48 overflow-y-auto"
                        />
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="prompt" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                {mode === 'generate' ? t('build.prompt.generate') : t('build.prompt.edit')}
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
                            placeholder={mode === 'generate' ? "e.g., A responsive portfolio landing page with a contact form" : "e.g., Change the primary color to green"} 
                            className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border min-h-[120px]" 
                        />
                    </div>
                    
                    <CustomSelect
                        label={t('build.language')}
                        value={language}
                        onChange={(val) => setLanguage(val as CodeLanguage)}
                        options={languageOptions}
                    />
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center shadow-lg shadow-accent-start/20 shrink-0">
                        {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                        {isLoading ? (mode === 'generate' ? t('build.building') : t('build.building')) : (mode === 'generate' ? t('build.action.generate') : t('build.action.edit'))}
                    </button>
                </form>
            </div>

            {/* Right Column: Output Area (Code / Preview) */}
            <div className={clsx(
                "flex-1 flex flex-col min-h-0 overflow-hidden",
                mobileTab !== 'build' ? 'flex' : 'hidden lg:flex'
            )}>
                 {/* Desktop View Switcher */}
                 <div className="hidden lg:flex items-center justify-end mb-4 gap-2 bg-light-surface dark:bg-dark-surface p-1.5 rounded-lg border border-light-border dark:border-dark-border w-fit ml-auto">
                    <button onClick={() => setDesktopView('code')} className={clsx("p-2 rounded-md transition-colors hover:bg-light-bg dark:hover:bg-dark-bg", desktopView === 'code' && "bg-light-bg dark:bg-dark-bg shadow-sm")}>
                        <ViewToggleIcon mode="code" current={desktopView} />
                    </button>
                    <button onClick={() => setDesktopView('split')} className={clsx("p-2 rounded-md transition-colors hover:bg-light-bg dark:hover:bg-dark-bg", desktopView === 'split' && "bg-light-bg dark:bg-dark-bg shadow-sm")}>
                        <ViewToggleIcon mode="split" current={desktopView} />
                    </button>
                    <button onClick={() => setDesktopView('preview')} className={clsx("p-2 rounded-md transition-colors hover:bg-light-bg dark:hover:bg-dark-bg", desktopView === 'preview' && "bg-light-bg dark:bg-dark-bg shadow-sm")}>
                         <ViewToggleIcon mode="preview" current={desktopView} />
                    </button>
                 </div>

                 <div className="flex-1 flex gap-4 min-h-0">
                    {/* Code Panel */}
                    <div className={clsx(
                        "flex-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg flex flex-col min-h-0 min-w-0",
                        // Mobile Logic
                        mobileTab === 'code' ? 'flex' : 'hidden',
                        // Desktop Logic
                        'lg:flex',
                        desktopView === 'preview' ? 'lg:hidden' : ''
                    )}>
                         {isLoading && !result && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary animate-pulse">{t('build.building')}</p>
                            </div>
                        )}
                        {!isLoading && !result && !error && (
                             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-light-text-secondary dark:text-dark-text-secondary opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                <p className="text-sm">Generated code will appear here.</p>
                            </div>
                        )}
                        {error && <div className="flex-1 flex items-center justify-center p-8 text-red-400 text-center"><p>{error}</p></div>}
                        
                        {result && (
                            <>
                                <div className="flex justify-between items-center p-3 border-b border-light-border dark:border-dark-border flex-shrink-0 bg-light-bg/30 dark:bg-dark-bg/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="ml-2 text-xs font-mono text-light-text-secondary dark:text-dark-text-secondary">{language}</span>
                                    </div>
                                    <button onClick={handleCopy} className="p-1.5 rounded hover:bg-light-bg dark:hover:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary transition-colors flex items-center gap-2">
                                        {copySuccess ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                                        <span className="text-xs font-medium">{copySuccess ? 'Copied' : 'Copy'}</span>
                                    </button>
                                </div>
                                <div className="code-output flex-1 overflow-auto custom-scrollbar bg-[#ffffff] dark:bg-[#1e1e1e] w-full">
                                    <Editor
                                        value={generatedCode}
                                        onValueChange={() => {}}
                                        highlight={codeHighlighter}
                                        readOnly
                                        padding={20}
                                        style={{ fontFamily: '"Fira Code", monospace', fontSize: 13 }}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Preview Panel */}
                    <div className={clsx(
                        "flex-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg flex flex-col min-h-0 min-w-0",
                        // Mobile Logic
                        mobileTab === 'preview' ? 'flex' : 'hidden',
                        // Desktop Logic
                        'lg:flex',
                        desktopView === 'code' ? 'lg:hidden' : ''
                    )}>
                        <div className="p-3 border-b border-light-border dark:border-dark-border flex-shrink-0 flex justify-between items-center bg-light-bg/30 dark:bg-dark-bg/30">
                            <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">{t('build.tab.preview')}</p>
                            {language === 'HTML/CSS' && previewUrl && (
                                <button
                                    onClick={() => window.open(previewUrl, '_blank')}
                                    className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium rounded bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border text-light-text-primary dark:text-dark-text-primary transition-colors border border-light-border dark:border-dark-border"
                                >
                                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                                    <span>New Tab</span>
                                </button>
                            )}
                        </div>
                        <div className="flex-1 bg-white relative overflow-hidden rounded-b-lg">
                            {language === 'HTML/CSS' && previewUrl ? (
                                <iframe
                                    src={previewUrl}
                                    title="Live Preview"
                                    className="w-full h-full border-0"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-center text-light-text-secondary bg-light-bg dark:bg-dark-bg dark:text-dark-text-secondary">
                                    <div className="p-8 max-w-sm">
                                        {language === 'HTML/CSS' ? (
                                             <p className="text-sm">Generate some HTML code to see a preview here.</p>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto opacity-30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                <p className="text-sm font-medium">Preview not available for {language}</p>
                                                <p className="text-xs opacity-70 mt-1">Only HTML/CSS can be previewed directly in the browser.</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default BuildStudio;