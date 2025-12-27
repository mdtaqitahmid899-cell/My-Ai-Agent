
import React, { useState } from 'react';
import { Feature, Message } from './types.ts';
import Sidebar from './components/layout/Sidebar.tsx';
import Header from './components/layout/Header.tsx';
import ChatWorkspace from './components/chat/ChatWorkspace.tsx';
import ImageStudio from './components/image/ImageStudio.tsx';
import WriteStudio from './components/write/WriteStudio.tsx';
import BuildStudio from './components/build/BuildStudio.tsx';
import ResearchStudio from './components/research/ResearchStudio.tsx';
import LearnStudio from './components/learn/LearnStudio.tsx';
import { FEATURES } from './constants.tsx';
import { useTheme } from './hooks/useTheme.ts';
import SettingsModal from './components/shared/SettingsModal.tsx';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext.tsx';

const Footer: React.FC = () => {
    const { t } = useLanguage();
    return (
        <footer className="shrink-0 py-3 lg:py-4 w-full z-20">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-x-6 gap-y-1 text-[10px] md:text-xs text-light-text-secondary dark:text-dark-text-secondary opacity-80">
                <div className="flex items-center gap-1.5">
                    <span className="font-medium">Made by</span>
                    <span className="font-bold bg-gradient-to-r from-accent-start to-accent-end bg-clip-text text-transparent uppercase tracking-wider">
                        Taqi Tahmid
                    </span>
                </div>
                
                <span className="hidden md:block w-1 h-1 rounded-full bg-current opacity-30"></span>
                
                <div className="flex items-center gap-1.5">
                    <span className="font-medium">{t('powered_by')}</span>
                    <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="flex items-center font-bold tracking-tight hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
                        <span className="text-accent-start">Google Gemini</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

const MainApp: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>(FEATURES[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const [chatSessionId, setChatSessionId] = useState(0);
  
  const { language } = useLanguage();

  // Lifted Chat State
  const [messages, setMessages] = useState<Message[]>([]);

  const handleNewChat = () => {
    setMessages([]);
    setChatSessionId(prev => prev + 1);
    setActiveFeature(FEATURES.find(f => f.id === 'chat') || FEATURES[0]);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeFeature.id) {
      case 'chat':
        return <ChatWorkspace key={`${language}-${chatSessionId}`} messages={messages} setMessages={setMessages} />;
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
        return <ChatWorkspace key={`${language}-${chatSessionId}`} messages={messages} setMessages={setMessages} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary font-sans overflow-hidden">
      <Sidebar 
        activeFeature={activeFeature} 
        setActiveFeature={setActiveFeature} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header 
            activeFeature={activeFeature} 
            onMenuClick={() => setSidebarOpen(true)} 
            onSettingsClick={() => setSettingsModalOpen(true)}
        />
        <main className="flex-1 overflow-hidden p-0 md:p-6 lg:p-8 relative">
           <div className="absolute inset-0 bg-gradient-to-tr from-accent-start/5 to-accent-end/5 pointer-events-none"></div>
           <div className="h-full w-full relative">
            {renderContent()}
          </div>
        </main>
        <Footer />
      </div>
       <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        onClearHistory={() => setMessages([])}
      />
    </div>
  );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <MainApp />
        </LanguageProvider>
    );
};

export default App;
