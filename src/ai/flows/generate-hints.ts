'use server';

/**
 * @fileOverview AI-powered hint generation for the matching game.
 *
 * - generateHints - A function that generates hints for the matching game.
 * - GenerateHintsInput - The input type for the generateHints function.
 * - GenerateHintsOutput - The return type for the generateHints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHintsInputSchema = z.object({
  question: z.string().describe('The question for which to generate hints.'),
  answers: z
    .array(z.object({userId: z.string(), answerText: z.string()}))
    .describe('An array of answers to the question, with user IDs.'),
  numHints: z
    .number()
    .int()
    .min(1)
    .max(5)
    .default(2)
    .describe('The number of hints to generate.'),
});
export type GenerateHintsInput = z.infer<typeof GenerateHintsInputSchema>;

const GenerateHintsOutputSchema = z.object({
  hints: z.array(z.string()).describe('An array of AI-generated hints.'),
});
export type GenerateHintsOutput = z.infer<typeof GenerateHintsOutputSchema>;

export async function generateHints(input: GenerateHintsInput): Promise<GenerateHintsOutput> {
  return generateHintsFlow(input);
}

const hintGenerationPrompt = ai.definePrompt({
  name: 'hintGenerationPrompt',
  input: {schema: GenerateHintsInputSchema},
  output: {schema: GenerateHintsOutputSchema},
  prompt: `You are an AI assistant designed to provide hints for a game where users match answers to questions with the person who gave the answer. Analyze the writing styles in the provided answers to identify similarities between different users. Generate {{numHints}} hints that point out these similarities to help users make better matches.

Question: {{{question}}}

Answers:
{{#each answers}}
- User ID: {{userId}}, Answer: {{{answerText}}}
{{/each}}

Hints should:
- Focus on writing style similarities (e.g., similar phrases, sentence structure, vocabulary).
- Be concise and helpful.
- NOT directly reveal the correct matches.

Output the hints in a numbered list.
`,
});

const generateHintsFlow = ai.defineFlow(
  {
    name: 'generateHintsFlow',
    inputSchema: GenerateHintsInputSchema,
    outputSchema: GenerateHintsOutputSchema,
  },
  async input => {
    const {output} = await hintGenerationPrompt(input);
    return output!;
  }
);
