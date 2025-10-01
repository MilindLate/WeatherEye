
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Thermometer, Wind, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Alert = {
  id: string;
  city: string;
  country: string;
  type: 'Extreme Heat' | 'Severe Thunderstorm' | 'High Winds';
  summary: string;
  severity: 'High' | 'Severe';
};

// Mock data for global alerts
const mockAlerts: Alert[] = [
  {
    id: '1',
    city: 'Phoenix',
    country: 'USA',
    type: 'Extreme Heat',
    summary: 'An excessive heat warning is in effect, with temperatures expected to reach 45°C. Avoid outdoor activities.',
    severity: 'Severe',
  },
  {
    id: '2',
    city: 'Mumbai',
    country: 'India',
    type: 'Severe Thunderstorm',
    summary: 'Severe thunderstorms with heavy rain and potential for flash flooding are forecasted for the afternoon.',
    severity: 'Severe',
  },
  {
    id: '3',
    city: 'Wellington',
    country: 'New Zealand',
    type: 'High Winds',
    summary: 'Damaging winds gusting up to 120 km/h are expected. Secure loose objects and be cautious of falling debris.',
    severity: 'High',
  },
   {
    id: '4',
    city: 'Dubai',
    country: 'UAE',
    type: 'Extreme Heat',
    summary: 'Dangerous heat levels persisting, with index values near 50°C. Risk of heat-related illness is extremely high.',
    severity: 'Severe',
  },
];

const AlertIcon = ({ type }: { type: Alert['type'] }) => {
  switch (type) {
    case 'Extreme Heat':
      return <Thermometer className="w-6 h-6 text-red-500" />;
    case 'Severe Thunderstorm':
      return <Zap className="w-6 h-6 text-yellow-500" />;
    case 'High Winds':
      return <Wind className="w-6 h-6 text-orange-500" />;
    default:
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
  }
};


function AlertSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                 <Card key={i}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div>
                                <Skeleton className="h-7 w-48 mb-2" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                           <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data
        const timer = setTimeout(() => {
            setAlerts(mockAlerts);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen w-full bg-background">
            <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
                <Button asChild variant="outline" className="mb-4">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>

                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">Global Red Alerts</h1>
                    <p className="text-muted-foreground mt-2">Severe weather warnings currently active around the world.</p>
                </div>

                {loading ? (
                    <AlertSkeleton />
                ) : (
                    <div className="space-y-4 animate-in fade-in-0 duration-500">
                        {alerts.map((alert) => (
                            <Card key={alert.id} className="border-l-4 border-red-500">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-3">
                                                <AlertTriangle className="text-red-500" />
                                                {alert.type}
                                            </CardTitle>
                                            <CardDescription className="mt-1">{alert.city}, {alert.country}</CardDescription>
                                        </div>
                                        <AlertIcon type={alert.type} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground/90">{alert.summary}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
