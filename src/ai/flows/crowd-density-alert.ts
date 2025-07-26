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
  historicalCrowdData: z.array(z.object({ time: z.string(), density: z.number() })).describe('Historical crowd density data points for the same time period.'),
  location: z.string().describe('The name of the location.'),
});
export type CrowdDensityAlertInput = z.infer<typeof CrowdDensityAlertInputSchema>;

const CrowdDensityAlertOutputSchema = z.object({
  predictionText: z.string().describe('A short, concise summary of the crowd density prediction.'),
  predictedData: z.array(z.object({
    time: z.string().describe("The future time for the prediction, starting from the next hour, e.g., '6pm', '7pm'."),
    density: z.number().describe('The predicted crowd density at that time.'),
  })).length(3).describe('An array of 3 predicted data points for the next 3 hours.'),
});
export type CrowdDensityAlertOutput = z.infer<typeof CrowdDensityAlertOutputSchema>;

export async function crowdDensityAlert(input: CrowdDensityAlertInput): Promise<CrowdDensityAlertOutput> {
  return crowdDensityAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crowdDensityAlertPrompt',
  input: {schema: CrowdDensityAlertInputSchema},
  output: {schema: CrowdDensityAlertOutputSchema},
  prompt: `You are an expert in analyzing crowd density data and predicting future trends.

  Analyze the recent and historical crowd density data for the location: {{{location}}}.
  The last historical data point represents the current time and density.

  Recent Crowd Data Points (last 5): {{{recentCrowdData}}}
  Historical Crowd Data: {{#each historicalCrowdData}}{{this.time}}: {{this.density}}; {{/each}}

  Based on the data, generate a prediction for the next 3 hours.
  The prediction should include a short, concise text summary and a list of 3 data points, one for each of the next three hours.
  The 'time' for the predicted data should follow the format of the historical data (e.g., if the last point was '5pm', the next should be '6pm').

  Consider factors such as trends, patterns, and typical daily cycles for the given location type.
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
