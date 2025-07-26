'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/crowd-density-alert.ts';
import '@/ai/flows/detect-crowd-flow.ts';
import '@/ai/flows/generate-location-data-flow.ts';
import '@/ai/flows/chat-flow.ts';
