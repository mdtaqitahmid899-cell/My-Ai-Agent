import React from 'react';

// Fix: Define and export IconProps to be used for icon components, allowing className to be passed.
export type IconProps = {
  className?: string;
};

export interface Feature {
  id: string;
  name: string;
  // Fix: Use a more specific type for icon to allow passing className prop via React.cloneElement.
  icon: React.ReactElement<IconProps>;
  description: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export type ImageStyle = 'photorealistic' | 'isometric' | 'flat vector' | 'cinematic';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

// For WriteStudio
export type WritingTone = 'Professional' | 'Casual' | 'Persuasive' | 'Informative' | 'Creative';
export type WritingFormat = 'Blog Post' | 'Email' | 'Report' | 'Social Media Post' | 'Essay';
export type WritingLength = 'Short (~100 words)' | 'Medium (~300 words)' | 'Long (~500+ words)';

// For BuildStudio
export type CodeLanguage = 'JavaScript' | 'Python' | 'HTML/CSS' | 'TypeScript' | 'SQL';

// For ResearchStudio
export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ResearchResult {
  summary: string;
  sources: GroundingSource[];
}

// For LearnStudio
export interface StudyPlanResource {
  description: string;
  url: string;
}

export interface StudyPlanTopic {
  title: string;
  description: string;
  resources: StudyPlanResource[];
}

export interface StudyPlanWeek {
  week: number;
  title: string;
  topics: StudyPlanTopic[];
}

export interface StudyPlan {
  learningTopic: string;
  durationWeeks: number;
  weeklyBreakdown: StudyPlanWeek[];
}

// For VoiceInput
export interface Language {
  code: string;
  name: string;
}

// For HistoryStudio / Drive Integration
export interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
}

export interface BackupData {
  timestamp: string;
  settings: {
    geminiApiKey: string;
    theme: string;
    language: string;
  };
  chatHistory: Message[];
}