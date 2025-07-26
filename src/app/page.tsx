import { Header } from '@/components/header';
import { DashboardClient } from '@/components/dashboard-client';
import { locations } from '@/lib/data';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTitle,
} from '@/components/ui/sidebar';
import { RealtimeView } from '@/components/realtime-view';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-grow">
          <Sidebar>
            <SidebarHeader>
              <SidebarTitle>Real-time Monitor</SidebarTitle>
            </SidebarHeader>
            <SidebarContent>
              <RealtimeView />
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <main className="flex-grow container mx-auto p-4 md:p-8">
              <DashboardClient locations={locations} />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
