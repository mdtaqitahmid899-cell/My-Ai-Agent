import React, { useState } from 'react';
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

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>(FEATURES[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();

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
