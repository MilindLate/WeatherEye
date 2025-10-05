'use client';

import { useState, useEffect, useTransition, Suspense } from 'react';
import { getRealtimeWeatherData } from '@/app/actions';
import type { WeatherData } from '@/lib/weather-data';
import { getAgriculturalAdvice } from '@/app/actions';
import type { GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ThumbsDown, ThumbsUp, ServerCrash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

function AdviceSkeleton() {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

function AgricultureContent() {
    const searchParams = useSearchParams();
    const city = searchParams.get('city');

    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [advice, setAdvice] = useState<GenerateAgriculturalAdviceOutput | null>(null);
    const [isPending, startTransition] = useTransition();
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [aiError, setAiError] = useState(false);

    useEffect(() => {
        const fetchWeather = async () => {
            if (!city) {
                setLoadingWeather(false);
                return;
            };

            setLoadingWeather(true);
            const data = await getRealtimeWeatherData({ city });
            setWeatherData(data);
            setLoadingWeather(false);
        };
        fetchWeather();
    }, [city]);

    useEffect(() => {
        if (weatherData?.daily[0] && weatherData.current.locationName) {
            const todayForecast = weatherData.daily[0];
            startTransition(async () => {
                setAiError(false);
                const input = {
                    locationName: weatherData.current.locationName,
                    temperatureHigh: todayForecast.temp.max,
                    temperatureLow: todayForecast.temp.min,
                    condition: todayForecast.condition,
                    precipitationProbability: todayForecast.precipitation,
                };
                const result = await getAgriculturalAdvice(input);
                if (result === null) {
                    setAiError(true);
                }
                setAdvice(result);
            });
        }
    }, [weatherData]);

    const todayForecast = weatherData?.daily[0];

    const getDashboardLink = () => {
        const params = new URLSearchParams();
        if (city) params.set('city', city);
        return `/dashboard?${params.toString()}`;
    }

    if (loadingWeather) {
         return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-muted-foreground animate-pulse">Loading location forecast...</p>
            </div>
        );
    }
    
    if (!city) {
         return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
                <p className="text-destructive">No location specified.</p>
                <Button asChild>
                    <Link href="/location">Select a Location</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background">
            <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
                 <Button asChild variant="outline" className="mb-4">
                    <Link href={getDashboardLink()}>
                        <ArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>

                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">Agricultural Guidance</h1>
                    <p className="text-muted-foreground mt-2">AI-powered crop recommendations for <span className="font-bold text-foreground">{weatherData?.current.locationName || city}</span>.</p>
                </div>

                {todayForecast && (
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle>Today's Forecast Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-2 rounded-lg">
                                <p className="text-sm text-muted-foreground">High Temp</p>
                                <p className="text-2xl font-bold">{Math.round(todayForecast.temp.max)}°C</p>
                            </div>
                            <div className="p-2 rounded-lg">
                                <p className="text-sm text-muted-foreground">Low Temp</p>
                                <p className="text-2xl font-bold">{Math.round(todayForecast.temp.min)}°C</p>
                            </div>
                            <div className="p-2 rounded-lg">
                                <p className="text-sm text-muted-foreground">Condition</p>
                                <p className="text-2xl font-bold">{todayForecast.condition}</p>
                            </div>
                            <div className="p-2 rounded-lg">
                                <p className="text-sm text-muted-foreground">Precipitation</p>
                                <p className="text-2xl font-bold">{Math.round(todayForecast.precipitation * 100)}%</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isPending || loadingWeather ? (
                    <AdviceSkeleton />
                ) : aiError ? (
                     <Card>
                        <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                            <ServerCrash className="w-10 h-10 text-destructive" />
                            <p>AI agricultural advice is currently unavailable.</p>
                            <p className="text-xs">Please try again later.</p>
                        </CardContent>
                    </Card>
                ) : advice ? (
                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in-0 duration-500">
                        <Card className="border-green-500/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-500">
                                    <ThumbsUp />
                                    Crops to Grow
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {advice.recommendations.map(rec => (
                                    <div key={rec.cropName} className="p-4 rounded-lg bg-muted/50">
                                        <p className="font-bold text-lg">{rec.cropName}</p>
                                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="border-red-500/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-500">
                                    <ThumbsDown />
                                    Crops to Avoid
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {advice.warnings.map(warn => (
                                    <div key={warn.cropName} className="p-4 rounded-lg bg-muted/50">
                                        <p className="font-bold text-lg">{warn.cropName}</p>
                                        <p className="text-sm text-muted-foreground">{warn.reason}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Could not generate agricultural advice at this time.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function AgriculturePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AgricultureContent />
        </Suspense>
    )
}
