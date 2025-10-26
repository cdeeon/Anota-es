'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a title for a note based on its content.
 *
 * The flow takes the note content as input and returns a generated title.
 * - generateNoteTitle - A function that generates a title for a given note content.
 * - GenerateNoteTitleInput - The input type for the generateNoteTitle function.
 * - GenerateNoteTitleOutput - The return type for the generateNoteTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNoteTitleInputSchema = z.object({
  content: z.string().describe('The content of the note.'),
});
export type GenerateNoteTitleInput = z.infer<typeof GenerateNoteTitleInputSchema>;

const GenerateNoteTitleOutputSchema = z.object({
  title: z.string().describe('The generated title for the note.'),
});
export type GenerateNoteTitleOutput = z.infer<typeof GenerateNoteTitleOutputSchema>;

export async function generateNoteTitle(input: GenerateNoteTitleInput): Promise<GenerateNoteTitleOutput> {
  return generateNoteTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNoteTitlePrompt',
  input: {schema: GenerateNoteTitleInputSchema},
  output: {schema: GenerateNoteTitleOutputSchema},
  prompt: `You are an expert at generating concise and descriptive titles for notes.

  Generate a title that accurately reflects the content of the note. The title should be no more than 10 words.

  Note Content: {{{content}}}`,
});

const generateNoteTitleFlow = ai.defineFlow(
  {
    name: 'generateNoteTitleFlow',
    inputSchema: GenerateNoteTitleInputSchema,
    outputSchema: GenerateNoteTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
