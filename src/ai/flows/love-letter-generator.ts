// src/ai/flows/love-letter-generator.ts
'use server';

/**
 * @fileOverview Generates personalized love letter suggestions based on relationship history and love notes.
 *
 * - loveLetterGenerator - A function that generates love letter suggestions.
 * - LoveLetterGeneratorInput - The input type for the loveLetterGenerator function.
 * - LoveLetterGeneratorOutput - The return type for the loveLetterGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LoveLetterGeneratorInputSchema = z.object({
  relationshipHistory: z
    .string()
    .describe('A detailed history of the relationship, including significant dates, events, and shared experiences.'),
  loveNotes: z
    .string()
    .describe('A collection of love notes, messages, and inside jokes shared between the partners.'),
  occasion: z.string().describe('The specific occasion or reason for writing the love letter (e.g., anniversary, birthday, just because).'),
});

export type LoveLetterGeneratorInput = z.infer<typeof LoveLetterGeneratorInputSchema>;

const LoveLetterGeneratorOutputSchema = z.object({
  loveLetterSuggestion: z.string().describe('A personalized love letter suggestion based on the relationship history, love notes, and occasion.'),
});

export type LoveLetterGeneratorOutput = z.infer<typeof LoveLetterGeneratorOutputSchema>;

export async function loveLetterGenerator(input: LoveLetterGeneratorInput): Promise<LoveLetterGeneratorOutput> {
  return loveLetterGeneratorFlow(input);
}

const loveLetterGeneratorPrompt = ai.definePrompt({
  name: 'loveLetterGeneratorPrompt',
  input: {schema: LoveLetterGeneratorInputSchema},
  output: {schema: LoveLetterGeneratorOutputSchema},
  prompt: `You are a professional love letter writer. Use the relationship history and love notes to create a personalized and heartfelt love letter suggestion for the given occasion.

Relationship History: {{{relationshipHistory}}}

Love Notes: {{{loveNotes}}}

Occasion: {{{occasion}}}

Love Letter Suggestion:`, // outputDescription is not supported for prompts
});

const loveLetterGeneratorFlow = ai.defineFlow(
  {
    name: 'loveLetterGeneratorFlow',
    inputSchema: LoveLetterGeneratorInputSchema,
    outputSchema: LoveLetterGeneratorOutputSchema,
  },
  async input => {
    const {output} = await loveLetterGeneratorPrompt(input);
    return output!;
  }
);
