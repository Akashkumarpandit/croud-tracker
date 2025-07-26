import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <TooltipProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                    <MainNav />
                </aside>
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <Header />
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
