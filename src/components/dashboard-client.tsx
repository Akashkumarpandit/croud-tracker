'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, BrainCircuit, Loader2, MapPin, Search, Sparkles, Users } from 'lucide-react';
import { getCrowdAlert } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HistoricalChart } from './historical-chart';
import type { Location } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Input } from './ui/input';

interface DashboardClientProps {
  locations: Location[];
}

interface AlertState {
  open: boolean;
  title: string;
  message: string;
}

export function DashboardClient({ locations }: DashboardClientProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(locations[0] || null);
  const [isAIPending, startAITransition] = useTransition();
  const [alertState, setAlertState] = useState<AlertState>({ open: false, title: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleGetAIAlert = (location: Location) => {
    startAITransition(async () => {
      const result = await getCrowdAlert(location);
      if (result.success) {
        setAlertState({
          open: true,
          title: `AI Alert for ${location.name}`,
          message: result.message,
        });
      } else {
        setAlertState({
          open: true,
          title: 'Error',
          message: result.message,
        });
      }
    });
  };

  const getDensityInfo = (density: number, capacity: number) => {
    const percentage = (density / capacity) * 100;
    if (percentage < 40) {
      return { level: 'Low', variant: 'default' as const, className: 'bg-accent/80 hover:bg-accent text-accent-foreground' };
    }
    if (percentage < 70) {
      return { level: 'Medium', variant: 'secondary' as const, className: 'bg-yellow-400/80 text-yellow-foreground hover:bg-yellow-400' };
    }
    return { level: 'High', variant: 'destructive' as const, className: '' };
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Locations</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => {
                const densityInfo = getDensityInfo(location.currentDensity, location.maxCapacity);
                return (
                  <Card
                    key={location.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-lg',
                      selectedLocation?.id === location.id ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'
                    )}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {location.name}
                        </span>
                        <Badge variant={densityInfo.variant} className={densityInfo.className}>
                          {densityInfo.level}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-5 w-5" />
                        <span>
                          Current Density: {location.currentDensity} / {location.maxCapacity}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetAIAlert(location);
                        }}
                        disabled={isAIPending}
                      >
                        {isAIPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Get AI Prediction
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No locations found.
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          {selectedLocation ? (
            <HistoricalChart data={selectedLocation.historicalData} />
          ) : (
            <Card className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <p>Select a location to view its history</p>
              </div>
            </Card>
          )}
        </div>
      </div>
      <Dialog open={alertState.open} onOpenChange={(open) => setAlertState({ ...alertState, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              {alertState.title}
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Prediction</AlertTitle>
            <AlertDescription>
              {alertState.message}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    </>
  );
}
