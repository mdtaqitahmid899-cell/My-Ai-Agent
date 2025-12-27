import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations } from '../utils/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('selected-language') || 'en-US';
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('selected-language', lang);
  };

  const t = (key: string): string => {
    const langCode = language; // e.g. 'en-US' or 'es-ES'
    
    // Fallback logic
    // 1. Try exact match
    if (translations[langCode] && translations[langCode][key]) {
        return translations[langCode][key];
    }
    
    // 2. Try generic language match (e.g. 'es' from 'es-MX') if we had generic keys (we don't right now but good practice)
    
    // 3. Fallback to English
    if (translations['en-US'] && translations['en-US'][key]) {
        return translations['en-US'][key];
    }

    // 4. Return key as last resort
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};