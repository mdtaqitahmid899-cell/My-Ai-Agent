
import React from 'react';
import type { Feature, IconProps, Language } from './types.ts';

const ChatIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ImageIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const WriteIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const BuildIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const ResearchIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LearnIcon = ({ className = "h-6 w-6" }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
    </svg>
);

export const PlusIcon = ({ className = "h-6 w-6" }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

export const SettingsIcon = ({ className = "h-6 w-6" }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const UserIcon = ({ className = "h-6 w-6" }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const FEATURES: Feature[] = [
  { id: 'chat', name: 'Chat', icon: <ChatIcon />, description: 'Engage in multi-turn conversations with a helpful AI.' },
  { id: 'image', name: 'Create Image', icon: <ImageIcon />, description: 'Generate stunning images from text descriptions.' },
  { id: 'write', name: 'Write', icon: <WriteIcon />, description: 'Get assistance with long-form writing tasks.' },
  { id: 'build', name: 'Build', icon: <BuildIcon />, description: 'Generate code snippets and entire applications.' },
  { id: 'research', name: 'Deep Research', icon: <ResearchIcon />, description: 'Perform iterative searches and get cited summaries.' },
  { id: 'learn', name: 'LearnBetter', icon: <LearnIcon />, description: 'Create personalized study plans and learning materials.' },
];

export const LANGUAGES: Language[] = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'af-ZA', name: 'Afrikaans' },
    { code: 'sq-AL', name: 'Shqip (Albanian)' },
    { code: 'ar-SA', name: 'العربية (Arabic)' },
    { code: 'hy-AM', name: 'Հայերեն (Armenian)' },
    { code: 'az-AZ', name: 'Azərbaycan (Azerbaijani)' },
    { code: 'eu-ES', name: 'Euskara (Basque)' },
    { code: 'be-BY', name: 'Беларуская (Belarusian)' },
    { code: 'bn-BD', name: 'বাংলা (Bengali)' },
    { code: 'bs-BA', name: 'Bosanski (Bosnian)' },
    { code: 'bg-BG', name: 'Български (Bulgarian)' },
    { code: 'ca-ES', name: 'Català (Catalan)' },
    { code: 'zh-CN', name: '中文 (简体) (Chinese, Simplified)' },
    { code: 'zh-TW', name: '中文 (繁體) (Chinese, Traditional)' },
    { code: 'hr-HR', name: 'Hrvatski (Croatian)' },
    { code: 'cs-CZ', name: 'Čeština (Czech)' },
    { code: 'da-DK', name: 'Dansk (Danish)' },
    { code: 'nl-NL', name: 'Nederlands (Dutch)' },
    { code: 'et-EE', name: 'Eesti (Estonian)' },
    { code: 'fil-PH', name: 'Filipino' },
    { code: 'fi-FI', name: 'Suomi (Finnish)' },
    { code: 'fr-FR', name: 'Français (French)' },
    { code: 'gl-ES', name: 'Galego (Galician)' },
    { code: 'ka-GE', name: 'ქართული (Georgian)' },
    { code: 'de-DE', name: 'Deutsch (German)' },
    { code: 'el-GR', name: 'Ελληνικά (Greek)' },
    { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)' },
    { code: 'he-IL', name: 'עברית (Hebrew)' },
    { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
    { code: 'hu-HU', name: 'Magyar (Hungarian)' },
    { code: 'is-IS', name: 'Íslenska (Icelandic)' },
    { code: 'id-ID', name: 'Bahasa Indonesia (Indonesian)' },
    { code: 'ga-IE', name: 'Gaeilge (Irish)' },
    { code: 'it-IT', name: 'Italiano (Italian)' },
    { code: 'ja-JP', name: '日本語 (Japanese)' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'kk-KZ', name: 'Қазақ (Kazakh)' },
    { code: 'km-KH', name: 'ខ្មែរ (Khmer)' },
    { code: 'ko-KR', name: '한국어 (Korean)' },
    { code: 'lo-LA', name: 'ລາວ (Lao)' },
    { code: 'lv-LV', name: 'Latviešu (Latvian)' },
    { code: 'lt-LT', name: 'Lietuvių (Lithuanian)' },
    { code: 'mk-MK', name: 'Македонски (Macedonian)' },
    { code: 'ms-MY', name: 'Bahasa Melayu (Malay)' },
    { code: 'ml-IN', name: 'മലയാളം (Malayalam)' },
    { code: 'mr-IN', name: 'मराठी (Marathi)' },
    { code: 'mn-MN', name: 'Монгол (Mongolian)' },
    { code: 'ne-NP', name: 'नेपाली (Nepali)' },
    { code: 'no-NO', name: 'Norsk (Norwegian)' },
    { code: 'fa-IR', name: 'فारसी (Persian)' },
    { code: 'pl-PL', name: 'Polski (Polish)' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'pt-PT', name: 'Português (Portugal)' },
    { code: 'pa-IN', name: 'ਪੰਜਾਬी (Punjabi)' },
    { code: 'ro-RO', name: 'Română (Romanian)' },
    { code: 'ru-RU', name: 'Русский (Russian)' },
    { code: 'sr-RS', name: 'Српски (Serbian)' },
    { code: 'si-LK', name: 'සිංහල (Sinhala)' },
    { code: 'sk-SK', name: 'Slovenčina (Slovak)' },
    { code: 'sl-SI', name: 'Slovenščina (Slovenian)' },
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'es-MX', name: 'Español (México)' },
    { code: 'sw-KE', name: 'Kiswahili (Swahili)' },
    { code: 'sv-SE', name: 'Svenska (Swedish)' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)' },
    { code: 'th-TH', name: 'ไทย (Thai)' },
    { code: 'tr-TR', name: 'Türkçe (Turkish)' },
    { code: 'uk-UA', name: 'Українська (Ukrainian)' },
    { code: 'ur-PK', name: 'اردو (Urdu)' },
    { code: 'uz-UZ', name: 'O‘zbek (Uzbek)' },
    { code: 'vi-VN', name: 'Tiếng Việt (Vietnamese)' },
    { code: 'zu-ZA', name: 'isiZulu (Zulu)' },
];
