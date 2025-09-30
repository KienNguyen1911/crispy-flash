'use server';
/**
 * @fileOverview AI-powered vocabulary enhancement flow.
 *
 * This flow takes a vocabulary entry and enhances it with additional information such as
 * associated images or usage examples.
 *
 * @function enhanceVocabularyEntry - Enhances a vocabulary entry using AI.
 * @typedef {EnhanceVocabularyEntryInput} EnhanceVocabularyEntryInput - The input type for the enhanceVocabularyEntry function.
 * @typedef {EnhanceVocabularyEntryOutput} EnhanceVocabularyEntryOutput - The return type for the enhanceVocabularyEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceVocabularyEntryInputSchema = z.object({
  kanji: z.string().describe('The Kanji character of the vocabulary entry.'),
  hiraganaKatakana: z
    .string()
    .describe('The Hiragana or Katakana reading of the vocabulary entry.'),
  meaning: z.string().describe('The meaning of the vocabulary entry.'),
  image: z
    .string()
    .optional()
    .describe(
      'An optional image of the vocabulary entry, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // eslint-disable-line max-len
    ),
  type: z
    .enum(['simple word', 'grouped by Kanji'])
    .describe('The type of vocabulary entry.'),
  usageExample: z
    .string()
    .optional()
    .describe('An optional usage example of the vocabulary entry.'),
});
export type EnhanceVocabularyEntryInput = z.infer<
  typeof EnhanceVocabularyEntryInputSchema
>;

const EnhanceVocabularyEntryOutputSchema = z.object({
  enhancedImage: z
    .string()
    .optional()
    .describe(
      'An enhanced image of the vocabulary entry, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // eslint-disable-line max-len
    ),
  enhancedUsageExample: z
    .string()
    .optional()
    .describe('An enhanced usage example of the vocabulary entry.'),
});
export type EnhanceVocabularyEntryOutput = z.infer<
  typeof EnhanceVocabularyEntryOutputSchema
>;

export async function enhanceVocabularyEntry(
  input: EnhanceVocabularyEntryInput
): Promise<EnhanceVocabularyEntryOutput> {
  return enhanceVocabularyEntryFlow(input);
}

const enhanceVocabularyEntryPrompt = ai.definePrompt({
  name: 'enhanceVocabularyEntryPrompt',
  input: {schema: EnhanceVocabularyEntryInputSchema},
  output: {schema: EnhanceVocabularyEntryOutputSchema},
  prompt: `You are an AI assistant that enhances vocabulary entries for flashcards.

  Given the following vocabulary entry, please provide an enhanced image and a usage example.  If the image or usage example is already provided, enhance it, otherwise generate a new one.

  Kanji: {{{kanji}}}
Hiragana/Katakana: {{{hiraganaKatakana}}}
Meaning: {{{meaning}}}
Type: {{{type}}}
Current Image: {{#if image}}{{media url=image}}{{else}}None{{/if}}
Current Usage Example: {{{usageExample}}}

  Enhanced Image:
  Enhanced Usage Example:`,
});

const enhanceVocabularyEntryFlow = ai.defineFlow(
  {
    name: 'enhanceVocabularyEntryFlow',
    inputSchema: EnhanceVocabularyEntryInputSchema,
    outputSchema: EnhanceVocabularyEntryOutputSchema,
  },
  async input => {
    const {output} = await enhanceVocabularyEntryPrompt(input);
    return output!;
  }
);
