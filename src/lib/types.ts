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
};

export type Project = {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
};