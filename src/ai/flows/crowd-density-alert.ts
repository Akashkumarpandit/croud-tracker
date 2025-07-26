'use server';
/**
 * @fileOverview A crowd density alert AI agent.
 *
 * - crowdDensityAlert - A function that handles the crowd density alert process.
 * - CrowdDensityAlertInput - The input type for the crowdDensityAlert function.
 * - CrowdDensityAlertOutput - The return type for the crowdDensityAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrowdDensityAlertInputSchema = z.object({
  recentCrowdData: z.array(z.number()).describe('Recent crowd density data points.'),
  historicalCrowdData: z.array(z.number()).describe('Historical crowd density data points for the same time period.'),
  location: z.string().describe('The name of the location.'),
});
export type CrowdDensityAlertInput = z.infer<typeof CrowdDensityAlertInputSchema>;

const CrowdDensityAlertOutputSchema = z.object({
  alertMessage: z.string().describe('A message predicting changes in crowd density.'),
});
export type CrowdDensityAlertOutput = z.infer<typeof CrowdDensityAlertOutputSchema>;

export async function crowdDensityAlert(input: CrowdDensityAlertInput): Promise<CrowdDensityAlertOutput> {
  return crowdDensityAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crowdDensityAlertPrompt',
  input: {schema: CrowdDensityAlertInputSchema},
  output: {schema: CrowdDensityAlertOutputSchema},
  prompt: `You are an expert in analyzing crowd density data and predicting changes.

  Analyze the recent and historical crowd density data for the location: {{{location}}}.

  Recent Crowd Data: {{{recentCrowdData}}}
  Historical Crowd Data: {{{historicalCrowdData}}}

  Based on the data, generate an alert message predicting changes in crowd density.
  Consider factors such as trends, patterns, and anomalies.

  The alert message should be concise and informative.
  `,
});

const crowdDensityAlertFlow = ai.defineFlow(
  {
    name: 'crowdDensityAlertFlow',
    inputSchema: CrowdDensityAlertInputSchema,
    outputSchema: CrowdDensityAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
