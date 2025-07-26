'use server';

import { crowdDensityAlert } from '@/ai/flows/crowd-density-alert';
import { detectCrowdFromImage } from '@/ai/flows/detect-crowd-flow';
import { generateLocationData } from '@/ai/flows/generate-location-data-flow';
import { chat } from '@/ai/flows/chat-flow';
import type { Location } from '@/lib/types';
import type { Message } from '@/components/chatbot';

export async function getCrowdAlert(location: Location) {
  try {
    const recentCrowdData = location.historicalData.slice(-5).map(d => d.density);
    
    const result = await crowdDensityAlert({
      recentCrowdData,
      historicalCrowdData: location.historicalData,
      location: location.name,
    });

    return { success: true, ...result };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to generate alert. Please try again.' };
  }
}

export async function getRealtimeCrowdDensity(imageDataUri: string) {
  try {
    const result = await detectCrowdFromImage({ imageDataUri });
    return { success: true, density: result.crowdDensity };
  } catch (error) {
    console.error('Error detecting crowd from image:', error);
    return { success: false, message: 'Failed to analyze image.' };
  }
}

export async function addNewLocation(locationName: string) {
  try {
    const result = await generateLocationData({ locationName });
    const newLocation: Location = {
      id: `loc_${Date.now()}`,
      name: locationName,
      ...result,
    };
    return { success: true, location: newLocation };
  } catch (error) {
    console.error('Error generating location data:', error);
    return { success: false, message: 'Failed to generate location data.' };
  }
}

export async function getChatReply(history: Message[], message: string) {
    try {
        const result = await chat({
            history: history.map(m => ({ role: m.role, content: m.text })),
            message,
        });
        return { success: true, reply: result.reply };
    } catch (error) {
        console.error('Error getting chat reply:', error);
        return { success: false, message: 'Sorry, I had trouble getting a response. Please try again.' };
    }
}
