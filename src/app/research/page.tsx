'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, BookMarked, ExternalLink, Globe2, Database, Rocket } from 'lucide-react';

const researchLinks = [
    {
        title: "NASA Space Apps Challenge: Cleaner, Safer Skies",
        description: "An innovation challenge focused on using Earth observation data and cloud computing to predict and improve air quality.",
        link: "https://www.spaceappschallenge.org/2025/challenges/from-earthdata-to-action-cloud-computing-with-earth-observation-data-for-predicting-cleaner-safer-skies/?tab=resources",
        icon: <Rocket />,
    },
    {
        title: "NASA Earthdata",
        description: "The primary gateway to NASA's vast collection of Earth science data, including satellite imagery, climate models, and atmospheric data.",
        link: "https://earthdata.nasa.gov/",
        icon: <Globe2 />,
    },
    {
        title: "Google Earth Engine",
        description: "A cloud platform for planetary-scale geospatial analysis, offering a multi-petabyte catalog of satellite imagery and analysis tools.",
        link: "https://earthengine.google.com/",
        icon: <Database />,
    },
    {
        title: "NOAA Data Access",
        description: "Access to the National Oceanic and Atmospheric Administration's comprehensive archive of weather, climate, and oceanographic data.",
        link: "https://www.noaa.gov/data-access",
        icon: <Database />,
    },
     {
        title: "Copernicus Climate Data Store (CDS)",
        description: "A single point of access to a wide range of quality-assured data about the Earth's past, present, and future climate.",
        link: "https://cds.climate.copernicus.eu/#!/home",
        icon: <Globe2 />,
    },
];

function ResearchContent() {
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
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <Button asChild variant="outline">
                    <Link href={getDashboardLink()}>
                        <ArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

                <div className="text-center">
                    <BookMarked className="mx-auto h-16 w-16 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tight text-primary mt-4 font-headline">Research & Resources</h1>
                    <p className="text-muted-foreground mt-2">A curated list of data sources and tools for researchers and enthusiasts.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {researchLinks.map((item, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader className="flex flex-row items-start gap-4">
                                <div className="text-primary mt-1">{item.icon}</div>
                                <div>
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                    <CardDescription className="mt-2">{item.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Button asChild variant="secondary" className="w-full">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                                        Visit Resource <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}


export default function ResearchPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <ResearchContent />
        </Suspense>
    )
}
