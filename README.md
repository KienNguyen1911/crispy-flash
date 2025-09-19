---
title: Flashcard Learning System - Detailed Specifications
---

# 1. Overview

The Flashcard Learning System is designed to help users create projects,
organize topics, store vocabulary, and learn effectively using
flashcards. The system supports importing vocabulary data, previewing
before saving, and tracking learning progress with options such as
\'Remembered\' or \'Not Remembered\'.

# 2. Entities & Functions

## 2.1 Project

Functions:

• Create Project - Allows the user to create a new project with a name
and description.

• Edit Project - Modify project details (name, description).

• Delete Project - Permanently remove a project and its related topics
and vocabulary.

• List Projects - Retrieve and display all user projects.

• View Project Detail - Show detailed information and related topics.

## 2.2 Topic

Functions:

• Create Topic - Create a topic within a project.

• Edit Topic - Update topic information (title, description).

• Delete Topic - Remove a topic and its associated vocabulary.

• List Topics - Retrieve all topics under a project.

• View Topic Detail - Show topic information and related vocabulary.

## 2.3 Vocabulary

Attributes: Kanji, Hiragana/Katakana, Meaning, Image, Type (1: simple
word, 2: grouped by Kanji).

Functions:

• Import Vocabulary - Paste text data into a textarea. Example:\
日 にち / ひ Ngày, mặt trời\
月 つき / がつ Mặt trăng, tháng

• Preview Vocabulary Table - Display parsed data in a table format where
users can map columns (e.g., Kanji, Hiragana/Katakana, Meaning).

• Save Vocabulary - Store selected vocabulary into the system after
column mapping.

• Edit Vocabulary - Update details of a vocabulary item.

• Delete Vocabulary - Remove a vocabulary item.

• List Vocabulary - Retrieve vocabulary under a topic.

• Search/Filter Vocabulary - Allow searching by Kanji,
Hiragana/Katakana, or Meaning.

## 2.4 Flashcard Learning

Functions:

• Start Learning Session - Begin a flashcard session for a selected
topic or project.

• Flip Flashcard - Toggle between front (Kanji or Hiragana/Katakana) and
back (Meaning, Image).

• Mark as Remembered - Mark a vocabulary item as remembered.

• Mark as Not Remembered - Mark a vocabulary item as not remembered.

• Learn Only Not Remembered - Filter flashcards so users only review
those marked as not remembered.

• Review Progress - Show progress summary (total words, remembered, not
remembered).

# 3. User Flow

1\. User creates a project.\
2. User adds topics under the project.\
3. User imports vocabulary into topics via textarea input.\
4. User previews the vocabulary table, maps columns, and saves.\
5. User starts a flashcard learning session.\
6. During learning, user marks words as \'Remembered\' or \'Not
Remembered\'.\
7. User can choose to review only \'Not Remembered\' words in the next
session.\
8. User checks progress through summary statistics.

# 4. Future Enhancements

• Spaced Repetition Algorithm integration for optimized learning.

• Multi-language support for vocabulary.

• Export/Import vocabulary as CSV/Excel.

• Gamification (badges, streaks, levels).


🚀 Đề xuất kiến trúc tổng thể

Next.js (Frontend + Backend API routes)

NextAuth.js (Google Login)

Prisma ORM + PostgreSQL (Supabase)

TailwindCSS + shadcn/ui (UI)

Framer Motion (flashcard animation)

React Query (state server)