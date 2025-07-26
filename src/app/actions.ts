'use server';

import { crowdDensityAlert } from '@/ai/flows/crowd-density-alert';
import type { Location } from '@/lib/types';

export async function getCrowdAlert(location: Location) {
  try {
    const recentCrowdData = location.historicalData.slice(-5).map(d => d.density);
    const historicalCrowdData = location.historicalData.map(d => d.density);

    const result = await crowdDensityAlert({
      recentCrowdData,
      historicalCrowdData,
      location: location.name,
    });

    return { success: true, message: result.alertMessage };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to generate alert. Please try again.' };
  }
}
