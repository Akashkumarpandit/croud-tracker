import { Header } from '@/components/header';
import { DashboardClient } from '@/components/dashboard-client';
import { locations } from '@/lib/data';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <DashboardClient locations={locations} />
      </main>
    </div>
  );
}
