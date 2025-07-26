'use server';
/**
 * @fileOverview An AI agent for generating synthetic location data.
 *
 * - generateLocationData - A function that generates historical crowd data for a new location.
 * - GenerateLocationDataInput - The input type for the generateLocationData function.
 * - GenerateLocationDataOutput - The return type for the generateLocationData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocationDataInputSchema = z.object({
  locationName: z.string().describe('The name of the location to generate data for.'),
});
export type GenerateLocationDataInput = z.infer<typeof GenerateLocationDataInputSchema>;

const GenerateLocationDataOutputSchema = z.object({
    maxCapacity: z.number().describe('A realistic maximum capacity for the location.'),
    currentDensity: z.number().describe('A realistic current density, which should be the last data point in the historical data.'),
    historicalData: z.array(z.object({
        time: z.string().describe("The time of the data point, e.g., '9am', '10am'."),
        density: z.number().describe('The crowd density at that time.'),
    })).length(9).describe('An array of 9 historical data points representing a typical day from 9am to 5pm.'),
});
export type GenerateLocationDataOutput = z.infer<typeof GenerateLocationDataOutputSchema>;

export async function generateLocationData(input: GenerateLocationDataInput): Promise<GenerateLocationDataOutput> {
  return generateLocationDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLocationDataPrompt',
  input: {schema: GenerateLocationDataInputSchema},
  output: {schema: GenerateLocationDataOutputSchema},
  prompt: `You are a city planning simulator. Given a location name, generate a realistic data profile for it.

Location Name: {{{locationName}}}

Generate the following:
1. A realistic maximum capacity for this type of location.
2. A series of 9 historical crowd density data points for a typical day (9am to 5pm). The crowd levels should show a plausible daily pattern (e.g., lower in the morning, peaking midday, and then tapering off).
3. A realistic current density, which must be the same as the density of the last historical data point (5pm).

For example, a "plaza" might have a higher capacity than a small "cafe". A "station" would have peaks during commute times.
`,
});

const generateLocationDataFlow = ai.defineFlow(
  {
    name: 'generateLocationDataFlow',
    inputSchema: GenerateLocationDataInputSchema,
    outputSchema: GenerateLocationDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
