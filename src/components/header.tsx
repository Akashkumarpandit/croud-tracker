import Link from 'next/link';
import { Eye, PanelLeft, Camera, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Eye className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">CrowdWatch</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/realtime"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Camera className="h-5 w-5" />
              Real-time
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg hidden sm:block">
            <Eye className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight hidden sm:block">
            CrowdWatch
        </h1>
      </div>
    </header>
  );
}
