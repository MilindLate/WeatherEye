
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Thermometer, Wind, Zap, Waves, Flame, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getGlobalAlerts } from '../actions';
import type { GlobalAlert } from '@/ai/flows/generate-global-alerts';
import { Badge } from '@/components/ui/badge';


const AlertIcon = ({ type }: { type: GlobalAlert['type'] }) => {
  switch (type) {
    case 'Extreme Heat':
      return <Thermometer className="w-8 h-8 text-red-500" />;
    case 'Severe Thunderstorm':
      return <Zap className="w-8 h-8 text-yellow-500" />;
    case 'High Winds':
      return <Wind className="w-8 h-8 text-blue-400" />;
    case 'Flooding':
        return <Waves className="w-8 h-8 text-blue-600" />;
    case 'Wildfire':
        return <Flame className="w-8 h-8 text-orange-600" />;
    case 'Tsunami Watch':
        return <Waves className="w-8 h-8 text-cyan-500" />;
    default:
      return <AlertTriangle className="w-8 h-8 text-gray-500" />;
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
                         <Skeleton className="h-4 w-1/4 mb-3" />
                        <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

const getSeverityClasses = (severity: GlobalAlert['severity']): { bg: string, text: string, border: string } => {
    switch (severity) {
        case 'Critical': return { bg: 'bg-red-900/20', text: 'text-red-400', border: 'border-red-600/50' };
        case 'Severe': return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/50' };
        case 'High': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/50' };
        default: return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/50' };
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
                        {alerts.map((alert) => {
                            const severityClasses = getSeverityClasses(alert.severity);
                            return (
                                <Card key={alert.id} className={`border ${severityClasses.border} ${severityClasses.bg} overflow-hidden`}>
                                    <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
                                        <div className="flex-1 space-y-1">
                                            <CardTitle className="text-lg">{alert.type}</CardTitle>
                                            <CardDescription>{alert.city}, {alert.country}</CardDescription>
                                        </div>
                                        <div className="p-3 bg-background/50 rounded-full">
                                          <AlertIcon type={alert.type} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                         <Badge variant="destructive" className={`${severityClasses.bg} ${severityClasses.text} border-0 mb-3`}>
                                            {alert.severity} Severity
                                        </Badge>
                                        <p className="text-foreground/90">{alert.summary}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
