
'use client';

import { Suspense, memo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

// Dynamically import the map component and wrap it with React.memo
// This prevents re-rendering and is key to fixing the map initialization error.
const Map = memo(dynamic(() => import('@/components/map'), { 
    ssr: false,
    loading: () => <Skeleton className="h-[calc(100vh-200px)] w-full" />
}));

function MapPage() {
    const searchParams = useSearchParams();

    const getDashboardLink = () => {
        const city = searchParams.get('city');
        const lat = searchParams.get('lat');
        const lon = searchParams.get('lon');
        const params = new URLSearchParams();
        if (city) {
            params.set('city', city);
        } else if (lat && lon) {
            params.set('lat', lat);
            params.set('lon', lon);
        }
        return `/dashboard?${params.toString()}`;
    }

    return (
        <div className="min-h-screen w-full bg-background">
            <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
                <Button asChild variant="outline" className="mb-4">
                    <Link href={getDashboardLink()}>
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
                        <Map />
                   </Suspense>
                </div>
            </div>
        </div>
    );
}

export default function MapPageWrapper() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <MapPage />
        </Suspense>
    )
}
