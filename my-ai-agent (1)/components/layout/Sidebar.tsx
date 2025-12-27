
import React from 'react';
import type { Feature } from '../../types';
import { FEATURES, PlusIcon } from '../../constants';
import clsx from 'clsx';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  activeFeature: Feature;
  setActiveFeature: (feature: Feature) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeFeature, setActiveFeature, isOpen, setIsOpen, onNewChat }) => {
  const { t } = useLanguage();
  
  const handleFeatureClick = (feature: Feature) => {
    setActiveFeature(feature);
    setIsOpen(false);
  };
  
  return (
    <>
        {/* --- Mobile Navigation (Launcher Style) --- */}
        <div 
            className={clsx(
                'fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-out',
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none delay-100'
            )}
        >
            {/* Backdrop with blur */}
            <div 
                className="absolute inset-0 bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur-xl"
                onClick={() => setIsOpen(false)} 
            />

            {/* Content Container */}
            <div className={clsx(
                "relative z-10 flex flex-col h-full p-6 transition-transform duration-300 delay-75",
                isOpen ? "translate-y-0 scale-100" : "translate-y-10 scale-95"
            )}>
                 {/* Mobile Header */}
                 <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-accent-start to-accent-end p-2 rounded-xl shadow-lg">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4A2.5 2.5 0 0 1 9.5 2Z" />
                                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4A2.5 2.5 0 0 0 14.5 2Z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">{t('menu')}</span>
                     </div>
                     <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                 </div>

                 {/* Grid Layout */}
                 <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-8 custom-scrollbar">
                    {/* New Chat Special Button */}
                    <button
                        onClick={onNewChat}
                        className="col-span-2 flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-accent-start to-accent-end text-white shadow-lg active:scale-[0.98] transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <PlusIcon className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-lg">{t('new_chat')}</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-80" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {FEATURES.map((feature) => {
                        const isActive = activeFeature.id === feature.id;
                        return (
                           <button
                             key={feature.id}
                             onClick={() => handleFeatureClick(feature)}
                             className={clsx(
                               'flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-200 active:scale-95 text-center gap-3 shadow-sm',
                               isActive 
                                 ? 'bg-light-surface dark:bg-dark-surface border-accent-start ring-2 ring-accent-start/20' 
                                 : 'bg-white dark:bg-[#2f2f2f] border-light-border dark:border-[#424242] hover:border-accent-start/50'
                             )}
                           >
                             <div className={clsx(
                                 "p-3 rounded-full transition-colors",
                                 isActive ? "bg-accent-start text-white shadow-md" : "bg-light-bg dark:bg-dark-bg text-accent-start"
                             )}>
                               {React.cloneElement(feature.icon, { className: 'h-7 w-7' })}
                             </div>
                             <div className="flex flex-col">
                                <span className={clsx("font-bold text-sm", isActive ? "text-accent-start" : "text-light-text-primary dark:text-dark-text-primary")}>
                                    {t(`feature.${feature.id}`)}
                                </span>
                             </div>
                           </button>
                        );
                    })}
                 </div>
                 
                 <div className="mt-auto pt-6 text-center">
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {t('powered_by')} <span className="text-accent-start font-semibold">Gemini</span>
                    </p>
                 </div>
            </div>
        </div>

        {/* --- Desktop Sidebar (Hidden on Mobile) --- */}
        <nav className="hidden lg:flex flex-col h-full w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border flex-shrink-0 z-40">
            <div className="p-4 flex flex-col h-full overflow-y-auto">
                {/* Header */}
                <div className="flex items-center shrink-0 mb-8 px-2">
                    <div className="relative flex items-center justify-center">
                         <div className="absolute inset-0 bg-accent-start blur-lg opacity-20 dark:opacity-40 rounded-full"></div>
                         <div className="bg-gradient-to-br from-accent-start to-accent-end rounded-xl p-2.5 shadow-lg relative z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4A2.5 2.5 0 0 1 9.5 2Z" />
                                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4A2.5 2.5 0 0 0 14.5 2Z" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-3">
                        <h1 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary whitespace-nowrap tracking-tight">My-Ai Agent</h1>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">{t('pro_assistant')}</p>
                    </div>
                </div>

                {/* New Chat Button */}
                <button
                    onClick={onNewChat}
                    className="flex items-center justify-start p-3 mb-6 rounded-lg w-full text-left transition-all duration-200 bg-gradient-to-r from-accent-start to-accent-end text-white shadow-lg hover:shadow-accent-start/30 hover:scale-[1.02]"
                >
                    <PlusIcon className="h-6 w-6 shrink-0" />
                    <span className="ml-3 font-semibold whitespace-nowrap">{t('new_chat')}</span>
                </button>

                {/* Features Section */}
                <div className="space-y-1 mb-8">
                    {FEATURES.map((feature) => (
                        <button
                          key={feature.id}
                          onClick={() => handleFeatureClick(feature)}
                          className={clsx(
                            'flex items-center p-3 rounded-lg w-full text-left transition-all duration-200 group',
                            {
                                'bg-light-bg dark:bg-dark-bg text-accent-start font-semibold shadow-sm': activeFeature.id === feature.id,
                                'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg hover:text-light-text-primary dark:hover:text-dark-text-primary': activeFeature.id !== feature.id,
                            }
                          )}
                           title={t(`feature.${feature.id}`)}
                        >
                          <div className={clsx("transition-transform duration-200", { "scale-110": activeFeature.id === feature.id, "group-hover:scale-110": activeFeature.id !== feature.id })}>
                            {React.cloneElement(feature.icon, { className: 'h-5 w-5 shrink-0' })}
                          </div>
                          <span className="ml-4 font-medium whitespace-nowrap">{t(`feature.${feature.id}`)}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-grow"></div>
            </div>
        </nav>
    </>
  );
};

export default Sidebar;
