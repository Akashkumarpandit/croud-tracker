import { DashboardClient } from '@/components/dashboard-client';
import { locations } from '@/lib/data';

export default function DashboardPage() {
  return <DashboardClient locations={locations} />;
}
