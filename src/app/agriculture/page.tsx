'use client';

import { useState, useEffect, useTransition } from 'react';
import { getMockWeatherData } from '@/lib/weather-data';
import type { WeatherData, DailyForecast } from '@/lib/weather-data';
import { getAgriculturalAdvice } from '@/app/actions';
import type { GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function AgriculturePage() {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [advice, setAdvice] = useState<GenerateAgriculturalAdviceOutput | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        // Using mock weather data for now, similar to the main dashboard
        const data = getMockWeatherData(51.5072, -0.1276);
        setWeatherData(data);
    }, []);

    useEffect(() => {
        if (weatherData?.daily[0]) {
            const todayForecast = weatherData.daily[0];
            startTransition(async () => {
                const input = {
                    temperatureHigh: todayForecast.temp.max,
                    temperatureLow: todayForecast.temp.min,
                    condition: todayForecast.condition,
                    precipitationProbability: todayForecast.precipitation,
                };
                const result = await getAgriculturalAdvice(input);
                setAdvice(result);
            });
        }
    }, [weatherData]);

    const todayForecast = weatherData?.daily[0];

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
                    <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">Agricultural Guidance</h1>
                    <p className="text-muted-foreground mt-2">AI-powered crop recommendations based on today's forecast.</p>
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

                {isPending ? (
                    <AdviceSkeleton />
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
