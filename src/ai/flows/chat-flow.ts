'use server';
/**
 * @fileOverview A conversational AI agent for the application.
 *
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
  message: z.string().describe('The latest user message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().describe('The AI-generated reply to the user message.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful AI assistant for the CrowdWatch application.
  Your goal is to answer user questions about the application's features and data.
  Be friendly, concise, and helpful.

  The application has the following features:
  - Dashboard: Shows a list of locations with their current crowd density and historical data. Users can add new locations and get AI predictions for future crowd levels.
  - Real-time: Uses the device's camera to analyze live video and show real-time crowd density.
  - Statistics: Displays overall statistics like average density and the most/least crowded locations.

  Here is the conversation history:
  {{#each history}}
  {{this.role}}: {{{this.content}}}
  {{/each}}

  Here is the user's latest message:
  user: {{{message}}}

  Generate a helpful and relevant reply.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
