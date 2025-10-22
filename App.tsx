import React, { useState, useEffect } from 'react';
import { Feature } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ChatWorkspace from './components/chat/ChatWorkspace';
import ImageStudio from './components/image/ImageStudio';
import WriteStudio from './components/write/WriteStudio';
import BuildStudio from './components/build/BuildStudio';
import ResearchStudio from './components/research/ResearchStudio';
import LearnStudio from './components/learn/LearnStudio';
import { FEATURES } from './constants';
import { useTheme } from './hooks/useTheme';
import SettingsModal from './components/shared/SettingsModal';

/**
 * A component that prompts the user to select an API key if one is not already available.
 * This screen is shown before the main application is rendered.
 */
const ApiKeySelector: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleSelectKey = async () => {
    setIsOpening(true);
    try {
      // Assuming window.aistudio.openSelectKey is provided by the platform.
      await (window as any).aistudio.openSelectKey();
      // After the user selects a key (or closes the dialog), we proceed to load the app.
      onKeySelected();
    } catch (error) {
      console.error('Failed to open API key selection:', error);
      setIsOpening(false); // Allow user to try again
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary">
      <div className="text-center p-8 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl max-w-md mx-4 animate-fade-in-up">
        <div className="bg-gradient-to-br from-accent-start to-accent-end rounded-lg p-3 inline-block mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h4a6 6 0 016 6z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Welcome to My-Ai Agent</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
          To get started, please select your Gemini API key. This is required to power all AI features of the application.
        </p>
        <button
          onClick={handleSelectKey}
          disabled={isOpening}
          className="w-full bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
        >
          {isOpening ? 'Opening...' : 'Select API Key'}
        </button>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-4">
          For information about API keys and billing, see{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent-start">
            Google AI's documentation
          </a>.
        </p>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>(FEATURES[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();

  const [isKeyReady, setIsKeyReady] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      // Assuming `window.aistudio` is provided by the platform environment.
      if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (hasKey) {
          setIsKeyReady(true);
        }
      } else {
        // Fallback for development environments where aistudio might not be present.
        // We assume `process.env.API_KEY` is set via other means (e.g. .env file).
        console.warn('AI Studio context not found. Assuming API key is set via environment variables.');
        setIsKeyReady(true);
      }
      setIsCheckingKey(false);
    };

    // Use a small timeout to avoid flashing the loading screen if the check is very fast.
    setTimeout(() => checkKey(), 200);
  }, []);

  const renderContent = () => {
    switch (activeFeature.id) {
      case 'chat':
        return <ChatWorkspace />;
      case 'image':
        return <ImageStudio />;
      case 'write':
        return <WriteStudio />;
      case 'build':
        return <BuildStudio />;
      case 'research':
        return <ResearchStudio />;
      case 'learn':
        return <LearnStudio />;
      default:
        return <ChatWorkspace />;
    }
  };

  if (isCheckingKey) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-light-bg dark:bg-dark-bg">
        <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isKeyReady) {
    return <ApiKeySelector onKeySelected={() => setIsKeyReady(true)} />;
  }

  return (
    <div className="flex h-screen w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary font-sans">
      <Sidebar 
        activeFeature={activeFeature} 
        setActiveFeature={setActiveFeature}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex flex-col flex-1">
        <Header 
            activeFeature={activeFeature} 
            onMenuClick={() => setSidebarOpen(true)} 
            onSettingsClick={() => setSettingsModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="h-full w-full">
            {renderContent()}
          </div>
        </main>
      </div>
       <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </div>
  );
};

export default App;
