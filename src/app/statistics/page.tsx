import { StatsClient } from '@/components/stats-client';
import { initialLocations } from '@/lib/data';

export default function StatisticsPage() {
  return <StatsClient locations={initialLocations} />;
}
