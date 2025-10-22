import React from 'react';
import type { Feature } from '../../types';
import { FEATURES, PlusIcon } from '../../constants';
import clsx from 'clsx';

interface SidebarProps {
  activeFeature: Feature;
  setActiveFeature: (feature: Feature) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeFeature, setActiveFeature, isOpen, setIsOpen }) => {
  const handleFeatureClick = (feature: Feature) => {
    setActiveFeature(feature);
    setIsOpen(false); // Close sidebar on mobile after selection
  };
  
  return (
    <>
        {/* Overlay for mobile view */}
        <div 
            className={clsx('fixed inset-0 bg-black/60 z-30 lg:hidden', {
                'block': isOpen,
                'hidden': !isOpen
            })}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
        ></div>
        <nav className={clsx(
            "fixed lg:relative flex flex-col h-full bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border transition-transform duration-300 ease-in-out z-40",
            {
                'w-64': true, // Keep width consistent
                '-translate-x-full lg:translate-x-0': !isOpen,
                'translate-x-0': isOpen,
            }
        )}>
            <div className="p-4 flex flex-col h-full overflow-y-auto">
                {/* Header */}
                <div className="flex items-center shrink-0 mb-8">
                    <div className="bg-gradient-to-br from-accent-start to-accent-end rounded-lg p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold ml-3 text-light-text-primary dark:text-dark-text-primary whitespace-nowrap">My-Ai Agent</h1>
                </div>

                {/* New Chat Button */}
                <button
                    onClick={() => handleFeatureClick(FEATURES.find(f => f.id === 'chat')!)}
                    className="flex items-center justify-center lg:justify-start p-3 mb-6 rounded-lg w-full text-left transition-colors duration-200 bg-gradient-to-r from-accent-start to-accent-end text-white shadow-lg hover:opacity-90"
                >
                    <PlusIcon className="h-6 w-6 shrink-0" />
                    <span className="ml-3 font-medium whitespace-nowrap">New Chat</span>
                </button>

                {/* Features Section */}
                <div className="space-y-2 mb-8">
                    {FEATURES.map((feature) => (
                        <button
                          key={feature.id}
                          onClick={() => handleFeatureClick(feature)}
                          className={clsx(
                            'flex items-center p-3 rounded-lg w-full text-left transition-colors duration-200',
                            {
                                'bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary font-semibold': activeFeature.id === feature.id,
                                'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg': activeFeature.id !== feature.id,
                            }
                          )}
                           title={feature.name}
                        >
                          {React.cloneElement(feature.icon, { className: 'h-5 w-5 shrink-0' })}
                          <span className="ml-4 font-medium whitespace-nowrap">{feature.name}</span>
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