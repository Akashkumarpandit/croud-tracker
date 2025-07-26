import { DashboardClient } from '@/components/dashboard-client';
import { initialLocations } from '@/lib/data';

export default function DashboardPage() {
  return <DashboardClient initialLocations={initialLocations} />;
}
