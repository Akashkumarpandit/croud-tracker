'use server';
/**
 * @fileOverview A crowd detection AI agent from an image.
 *
 * - detectCrowdFromImage - A function that detects crowd density from an image.
 * - DetectCrowdInput - The input type for the detectCrowdFromImage function.
 * - DetectCrowdOutput - The return type for the detectCrowdFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectCrowdInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a scene, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectCrowdInput = z.infer<typeof DetectCrowdInputSchema>;

const DetectCrowdOutputSchema = z.object({
  crowdDensity: z.number().min(0).max(100).describe('An estimated percentage of crowd density (0-100).'),
});
export type DetectCrowdOutput = z.infer<typeof DetectCrowdOutputSchema>;

export async function detectCrowdFromImage(input: DetectCrowdInput): Promise<DetectCrowdOutput> {
  return detectCrowdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCrowdPrompt',
  input: {schema: DetectCrowdInputSchema},
  output: {schema: DetectCrowdOutputSchema},
  prompt: `You are an expert at analyzing images to determine crowd density.
Analyze the provided image and estimate the crowd density as a percentage from 0 (empty) to 100 (extremely crowded).
Return only the estimated crowd density percentage.

Image: {{media url=imageDataUri}}`,
});

const detectCrowdFlow = ai.defineFlow(
  {
    name: 'detectCrowdFlow',
    inputSchema: DetectCrowdInputSchema,
    outputSchema: DetectCrowdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
