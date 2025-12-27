import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Feature } from '../../types';
import { SettingsIcon, LANGUAGES } from '../../constants';
import clsx from 'clsx';
import { useLanguage } from '../../contexts/LanguageContext';

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

const GlobeIcon = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SearchIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CheckIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const LanguageSelector: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredLanguages = useMemo(() => {
        return LANGUAGES.filter(lang => 
            lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            lang.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Tiny timeout to ensure the element is rendered and can accept focus
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleSelect = (code: string) => {
        setLanguage(code);
        setIsOpen(false);
        setSearchQuery('');
    };

    const currentLangCode = language.split('-')[0].toUpperCase();

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 border",
                    isOpen 
                        ? "bg-accent-start/10 border-accent-start text-accent-start"
                        : "bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:border-accent-start hover:text-accent-start"
                )}
                aria-label="Change Language"
            >
                <GlobeIcon className="h-5 w-5" />
                <span className="text-sm font-semibold">{currentLangCode}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 max-w-[90vw] bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl border border-light-border dark:border-dark-border z-50 animate-fade-in-up flex flex-col max-h-[70vh]">
                    {/* Search Bar Header */}
                    <div className="p-3 border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface rounded-t-xl shrink-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="text-light-text-secondary dark:text-dark-text-secondary h-4 w-4" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={t('search_language')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-accent-start focus:border-transparent outline-none transition-all text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary/50 dark:placeholder-dark-text-secondary/50"
                            />
                        </div>
                    </div>
                    
                    {/* Language List - Flex 1 and overflow-y-auto ensures it scrolls correctly within the flex container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1 min-h-0">
                        {filteredLanguages.length > 0 ? (
                            filteredLanguages.map(lang => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(lang.code);
                                    }}
                                    className={clsx(
                                        "w-full text-left px-4 py-2.5 rounded-lg flex items-center justify-between transition-colors text-sm mb-0.5 shrink-0 cursor-pointer",
                                        language === lang.code
                                            ? "bg-gradient-to-r from-accent-start/10 to-accent-end/10 text-accent-start font-semibold"
                                            : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg dark:hover:bg-dark-bg"
                                    )}
                                >
                                    <span>{lang.name}</span>
                                    {language === lang.code && <CheckIcon className="h-4 w-4" />}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                No languages found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ activeFeature, onMenuClick, onSettingsClick }) => {
  const { t } = useLanguage();
  return (
    <header className="p-4 md:px-6 border-b border-light-border dark:border-dark-border bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg"
          aria-label="Open sidebar"
        >
            <MenuIcon />
        </button>
        <div>
          <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{t(`feature.${activeFeature.id}`)}</h2>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Searchable Language Dropdown */}
        <LanguageSelector />
        
        <button 
            onClick={onSettingsClick}
            className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg"
            aria-label="Open settings"
        >
            <SettingsIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;