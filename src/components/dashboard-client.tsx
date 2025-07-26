
'use client';

import { useState, useTransition } from 'react';
import { BrainCircuit, Loader2, MapPin, PlusCircle, Search, Sparkles, Users, LineChart as LineChartIcon } from 'lucide-react';
import { getCrowdAlert, addNewLocation } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HistoricalChart } from './historical-chart';
import type { Location } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';


interface DashboardClientProps {
  initialLocations: Location[];
}

interface AlertState {
  open: boolean;
  title: string;
  message: string;
  data: { time: string; density: number }[];
}

export function DashboardClient({ initialLocations }: DashboardClientProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocations?.[0] || null);
  const [isAIPending, startAITransition] = useTransition();
  const [isAddingLocation, startAddingLocationTransition] = useTransition();
  const [alertState, setAlertState] = useState<AlertState>({ open: false, title: '', message: '', data: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [isAddLocationDialogOpen, setAddLocationDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGetAIAlert = (location: Location) => {
    startAITransition(async () => {
      const result = await getCrowdAlert(location);
      if (result.success && result.predictedData && result.predictionText) {
        setAlertState({
          open: true,
          title: `AI Prediction for ${location.name}`,
          message: result.predictionText,
          data: result.predictedData,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message ?? 'An unknown error occurred.',
        });
      }
    });
  };

  const handleAddNewLocation = () => {
    if (!newLocationName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a name for the new location.',
      });
      return;
    }
    startAddingLocationTransition(async () => {
      const result = await addNewLocation(newLocationName);
      if (result.success && result.location) {
        setLocations(prev => [...prev, result.location!]);
        setSelectedLocation(result.location);
        setNewLocationName('');
        setAddLocationDialogOpen(false);
        toast({
          title: 'Location Added',
          description: `Successfully added ${result.location.name}.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
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

  const combinedChartData = selectedLocation
    ? [
        ...selectedLocation.historicalData.map(d => ({ ...d, type: 'Historical' })),
        ...alertState.data.map(d => ({ ...d, type: 'Predicted' })),
      ]
    : [];


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Locations</h2>
                <Dialog open={isAddLocationDialogOpen} onOpenChange={setAddLocationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a New Location</DialogTitle>
                      <DialogDescription>
                        Enter a name for the new location. Our AI will generate realistic data for it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newLocationName}
                          onChange={(e) => setNewLocationName(e.target.value)}
                          className="col-span-3"
                          placeholder="e.g., Grand Central Market"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddNewLocation}
                        disabled={isAddingLocation}
                      >
                        {isAddingLocation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate & Add
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
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
                          <CardTitle className="flex items-center justify-between text-base">
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            </CardContent>
          </Card>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              {alertState.title}
            </DialogTitle>
          </DialogHeader>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>AI Summary</AlertTitle>
              <AlertDescription>
                {alertState.message}
              </AlertDescription>
            </Alert>
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                      <LineChartIcon className="h-5 w-5" />
                      Predicted Crowd Density
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="h-60 w-full">
                      <ResponsiveContainer>
                          <LineChart data={combinedChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  borderColor: 'hsl(var(--border))',
                                }}
                              />
                              <Legend />
                              <Line
                                  name="Historical"
                                  type="monotone"
                                  dataKey="density"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth={2}
                                  data={selectedLocation?.historicalData}
                                  dot={false}
                              />
                              <Line
                                  name="Predicted"
                                  type="monotone"
                                  dataKey="density"
                                  stroke="hsl(var(--accent))"
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  data={alertState.data}
                              />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
