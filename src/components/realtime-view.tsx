'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getRealtimeCrowdDensity } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface RealtimeDataPoint {
  time: string;
  density: number;
}

export function RealtimeView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isProcessing, startProcessingTransition] = useTransition();
  const { toast } = useToast();
  const [realtimeData, setRealtimeData] = useState<RealtimeDataPoint[]>([]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (hasCameraPermission && videoRef.current && !isProcessing) {
        captureAndProcessFrame();
      }
    }, 5000); // Process every 5 seconds

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCameraPermission, isProcessing]);

  const captureAndProcessFrame = () => {
    startProcessingTransition(async () => {
      if (!videoRef.current) return;

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');

      const result = await getRealtimeCrowdDensity(dataUri);
      if (result.success && result.density !== undefined) {
        const now = new Date();
        const newPoint: RealtimeDataPoint = {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          density: result.density,
        };
        setRealtimeData(prevData => [...prevData.slice(-9), newPoint]); // Keep last 10 points
      } else {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: result.message,
        });
      }
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Live Camera Feed
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full rounded-md border bg-muted">
              <video ref={videoRef} className="h-full w-full rounded-md" autoPlay muted playsInline />
              {!hasCameraPermission && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Alert variant="destructive" className="w-auto">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>Please allow camera access.</AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Real-time Density</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <LineChart data={realtimeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    domain={[0, 100]}
                    label={{ value: 'Density (%)', angle: -90, position: 'insideLeft', offset: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="density"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
