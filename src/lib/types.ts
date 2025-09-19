export type Vocabulary = {
  id: string;
  topicId: string;
  kanji: string;
  kana: string;
  meaning: string;
  image?: string;
  usageExample?: string;
  status: 'unseen' | 'remembered' | 'not_remembered';
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
