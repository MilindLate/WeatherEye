
'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the map component to ensure it's only loaded on the client-side
const Map = dynamic(() => import('@/components/map'), { 
    ssr: false,
    loading: () => <Skeleton className="h-[calc(100vh-200px)] w-full" />
});

export default function MapPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="min-h-screen w-full bg-background">
            <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
                <Button asChild variant="outline" className="mb-4">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>

                 <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-primary font-headline flex items-center justify-center gap-3">
                        <Globe />
                        Global Air Quality Map
                    </h1>
                    <p className="text-muted-foreground mt-2">Real-time AQI data from stations around the world.</p>
                </div>

                <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden border">
                   <Suspense fallback={<Skeleton className="h-full w-full" />}>
                        {isClient ? <Map /> : <Skeleton className="h-full w-full" />}
                   </Suspense>
                </div>
            </div>
        </div>
    );
}
