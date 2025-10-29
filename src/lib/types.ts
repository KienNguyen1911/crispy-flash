export type Vocabulary = {
  id: string;
  topicId: string;
  word: string;
  pronunciation: string;
  meaning: string;
  image?: string;
  usageExample?: string;
  status: 'unseen' | 'remembered' | 'not_remembered';
  part_of_speech?: string;
  exampleSentences?: string[];
  languageCode: string;
};

export type Topic = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  vocabulary: Vocabulary[];
  contentGenerationStatus?: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  contextualPracticeContent?: AIGeneratedContent;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
};

export type HeatmapData = {
  day: string;
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type AIGeneratedQuestion = {
  question: string;
  answer: string;
  options?: string[];
};

export type AIGeneratedContent = {
  story: string;
  targetWords: string[];
  questions: AIGeneratedQuestion[];
};

export type ContentGenerationResponse = {
  ok: boolean;
  content?: AIGeneratedContent;
  error?: string;
};