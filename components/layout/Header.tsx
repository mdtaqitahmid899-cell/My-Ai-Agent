import React from 'react';
import type { Feature } from '../../types';
import { SettingsIcon, UserIcon } from '../../constants';

interface HeaderProps {
  activeFeature: Feature;
  onMenuClick: () => void;
  onSettingsClick: () => void;
}

const MenuIcon = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const Header: React.FC<HeaderProps> = ({ activeFeature, onMenuClick, onSettingsClick }) => {
  return (
    <header className="p-4 md:px-6 border-b border-light-border dark:border-dark-border bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm flex items-center justify-between gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg"
          aria-label="Open sidebar"
        >
            <MenuIcon />
        </button>
        <div>
          <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{activeFeature.name}</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1 text-sm hidden md:block">{activeFeature.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
          <button 
            onClick={onSettingsClick}
            className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg"
            aria-label="Open settings"
          >
            <SettingsIcon />
          </button>
           <button 
            className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg"
            aria-label="User profile"
          >
            <UserIcon />
          </button>
      </div>
    </header>
  );
};

export default Header;
