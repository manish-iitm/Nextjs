// This is a server-side file
'use server';

/**
 * @fileOverview A project renaming AI agent.
 *
 * - suggestBetterName - A function that suggests a better name for a project.
 * - SuggestBetterNameInput - The input type for the suggestBetterName function.
 * - SuggestBetterNameOutput - The return type for the suggestBetterName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBetterNameInputSchema = z.object({
  projectName: z.string().describe('The current name of the project.'),
  projectDescription: z.string().optional().describe('The description of the project.'),
});
export type SuggestBetterNameInput = z.infer<typeof SuggestBetterNameInputSchema>;

const SuggestBetterNameOutputSchema = z.object({
  suggestedName: z.string().describe('A better, more descriptive name for the project.'),
  isLowQuality: z.boolean().describe('Whether the original project name was low quality.'),
});
export type SuggestBetterNameOutput = z.infer<typeof SuggestBetterNameOutputSchema>;

export async function suggestBetterName(input: SuggestBetterNameInput): Promise<SuggestBetterNameOutput> {
  return suggestBetterNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBetterNamePrompt',
  input: {schema: SuggestBetterNameInputSchema},
  output: {schema: SuggestBetterNameOutputSchema},
  prompt: `You are an expert project namer. You are responsible for determining the quality of a project name, and suggesting a better name if the original name is low quality.

  A low quality project name is one that is vague, uninteresting, or does not accurately reflect the project's purpose.

  You will receive the current project name, and an optional project description. Use these to make your determination.

  Project Name: {{{projectName}}}
  {{#if projectDescription}}
  Project Description: {{{projectDescription}}}
  {{/if}}

  First, you must set the isLowQuality output field to true or false.

  If isLowQuality is true, you MUST suggest a better name for the project in the suggestedName output field. The suggested name should be creative, interesting, and accurately reflect the project's purpose. It should be no more than 5 words.
  If isLowQuality is false, simply return the original project name in the suggestedName output field.
  `,
});

const suggestBetterNameFlow = ai.defineFlow(
  {
    name: 'suggestBetterNameFlow',
    inputSchema: SuggestBetterNameInputSchema,
    outputSchema: SuggestBetterNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
