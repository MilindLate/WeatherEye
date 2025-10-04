
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Thermometer, Wind, Zap, Waves, Fire, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getGlobalAlerts } from '../actions';
import type { GlobalAlert } from '@/ai/flows/generate-global-alerts';


const AlertIcon = ({ type }: { type: GlobalAlert['type'] }) => {
  switch (type) {
    case 'Extreme Heat':
      return <Thermometer className="w-6 h-6 text-red-500" />;
    case 'Severe Thunderstorm':
      return <Zap className="w-6 h-6 text-yellow-500" />;
    case 'High Winds':
      return <Wind className="w-6 h-6 text-orange-500" />;
    case 'Flooding':
        return <Waves className="w-6 h-6 text-blue-500" />;
    case 'Wildfire':
        return <Fire className="w-6 h-6 text-orange-600" />;
    case 'Tsunami Watch':
        return <Waves className="w-6 h-6 text-cyan-500" />;
    default:
      return <AlertTriangle className="w-6 h-6 text-gray-500" />;
  }
};


function AlertSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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

const getSeverityClass = (severity: GlobalAlert['severity']) => {
    switch (severity) {
        case 'Critical': return 'border-red-600';
        case 'Severe': return 'border-red-500';
        case 'High': return 'border-orange-500';
        default: return 'border-yellow-500';
    }
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<GlobalAlert[]>([]);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = () => {
        startTransition(async () => {
            setError(null);
            const result = await getGlobalAlerts();
            if (result) {
                setAlerts(result.alerts);
            } else {
                setError("Could not fetch global alerts at this time. Please try again.");
                setAlerts([]);
            }
        });
    }

    useEffect(() => {
        fetchAlerts();
    }, []);

    return (
        <div className="min-h-screen w-full bg-background">
            <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                     <Button variant="ghost" size="sm" onClick={fetchAlerts} disabled={isPending}>
                        <RefreshCw className={`mr-2 ${isPending ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>


                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">Global Red Alerts</h1>
                    <p className="text-muted-foreground mt-2">AI-generated severe weather warnings currently active around the world.</p>
                </div>

                {isPending ? (
                    <AlertSkeleton />
                ) : error ? (
                     <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4 animate-in fade-in-0 duration-500">
                        {alerts.map((alert) => (
                            <Card key={alert.id} className={`border-l-4 ${getSeverityClass(alert.severity)}`}>
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
                                    <p className="text-sm font-bold mt-2">Severity: {alert.severity}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
