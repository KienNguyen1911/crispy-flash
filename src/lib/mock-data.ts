import { v4 as uuidv4 } from 'uuid';
import type { Project, Topic, Vocabulary } from './types';

const initialVocabulary: Vocabulary[] = [
  {
    id: uuidv4(),
    topicId: 'jlpt-n5-topic-1',
    kanji: '日',
    kana: 'にち / ひ',
    meaning: 'Day, Sun',
    status: 'unseen',
    usageExample: '今日はいい天気ですね。 (Kyou wa ii tenki desu ne.) - It\'s nice weather today, isn\'t it?',
  },
  {
    id: uuidv4(),
    topicId: 'jlpt-n5-topic-1',
    kanji: '月',
    kana: 'つき / がつ',
    meaning: 'Moon, Month',
    status: 'unseen',
    usageExample: '来月の旅行が楽しみです。 (Raigetsu no ryokou ga tanoshimi desu.) - I am looking forward to next month\'s trip.',
  },
  {
    id: uuidv4(),
    topicId: 'jlpt-n5-topic-1',
    kanji: '一',
    kana: 'いち',
    meaning: 'One',
    status: 'unseen',
    usageExample: '一番好きな食べ物は何ですか？ (Ichiban suki na tabemono wa nan desu ka?) - What is your favorite food?',
  },
];

const initialTopics: Topic[] = [
  {
    id: 'jlpt-n5-topic-1',
    projectId: 'jlpt-n5-project',
    title: 'Basic Kanji',
    description: 'The first 20 essential Kanji for beginners.',
    vocabulary: initialVocabulary,
  },
   {
    id: 'jlpt-n5-topic-2',
    projectId: 'jlpt-n5-project',
    title: 'Common Greetings',
    description: 'Learn how to say hello, goodbye, and thank you.',
    vocabulary: [],
  },
];

export const initialProjects: Project[] = [
  {
    id: 'jlpt-n5-project',
    name: 'JLPT N5 Prep',
    description: 'A project to study for the Japanese Language Proficiency Test, level N5.',
    topics: initialTopics,
  },
  {
    id: 'travel-japan-project',
    name: 'Japanese for Travel',
    description: 'Essential phrases and vocabulary for traveling in Japan.',
    topics: [],
  },
];
