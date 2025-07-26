'use client';

import { BarChart, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import type { Location } from '@/lib/types';

interface StatsClientProps {
  locations: Location[];
}

export function StatsClient({ locations }: StatsClientProps) {
  const totalDensity = locations.reduce((acc, loc) => acc + loc.currentDensity, 0);
  const totalCapacity = locations.reduce((acc, loc) => acc + loc.maxCapacity, 0);
  const averageDensity = totalCapacity > 0 ? (totalDensity / totalCapacity) * 100 : 0;

  const mostCrowded = locations.reduce((prev, current) =>
    (prev.currentDensity / prev.maxCapacity) > (current.currentDensity / current.maxCapacity) ? prev : current
  );

  const leastCrowded = locations.reduce((prev, current) =>
    (prev.currentDensity / prev.maxCapacity) < (current.currentDensity / current.maxCapacity) ? prev : current
  );
  
  const chartData = locations.map(location => ({
    name: location.name,
    density: (location.currentDensity / location.maxCapacity) * 100
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Density</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageDensity.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Across all locations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Crowded</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostCrowded.name}</div>
          <p className="text-xs text-muted-foreground">
            {((mostCrowded.currentDensity / mostCrowded.maxCapacity) * 100).toFixed(1)}% full
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Least Crowded</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leastCrowded.name}</div>
          <p className="text-xs text-muted-foreground">
            {((leastCrowded.currentDensity / leastCrowded.maxCapacity) * 100).toFixed(1)}% full
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{locations.length}</div>
          <p className="text-xs text-muted-foreground">Currently monitored</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Location Density Comparison (%)</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-96 w-full">
                <ResponsiveContainer>
                    <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} interval={0} angle={-45} textAnchor="end" height={80}/>
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            }}
                        />
                        <Bar dataKey="density" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
