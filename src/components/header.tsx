import { Eye } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              CrowdWatch
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
