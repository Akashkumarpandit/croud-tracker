import { StatsClient } from '@/components/stats-client';
import { locations } from '@/lib/data';

export default function StatisticsPage() {
  return <StatsClient locations={locations} />;
}
