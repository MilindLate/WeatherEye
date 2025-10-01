'use client';

import { useState, useEffect } from 'react';
import type { WeatherData } from '@/lib/weather-data';
import { getMockWeatherData } from '@/lib/weather-data';
import CurrentWeather from './current-weather';
import HourlyForecast from './hourly-forecast';
import DailyForecast from './daily-forecast';
import AiSummary from './ai-summary';
import WeatherAlerts from './weather-alerts';
import { Skeleton } from './ui/skeleton';
import AirQuality from './air-quality';
import { Button } from './ui/button';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

function LoadingSkeleton() {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full" />
        </div>
    )
}

export default function WeatherApp() {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const data = getMockWeatherData(latitude, longitude);
                    setWeatherData(data);
                    setError(null);
                    setLoading(false);
                },
                (err) => {
                    setError(`Error getting location: ${err.message}. Using a default location.`);
                    const defaultLat = 51.5072; // London
                    const defaultLon = -0.1276;
                    const data = getMockWeatherData(defaultLat, defaultLon);
                    setWeatherData(data);
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by your browser. Using a default location.");
            const defaultLat = 51.5072; // London
            const defaultLon = -0.1276;
            const data = getMockWeatherData(defaultLat, defaultLon);
            setWeatherData(data);
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold text-primary mb-2 animate-pulse">WeatherEye</h1>
                <p className="text-muted-foreground animate-pulse">Detecting your location and fetching the forecast...</p>
            </div>
        );
    }
    
    if (!weatherData) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-destructive">{error || "Could not load weather data."}</p>
          </div>
        );
    }

    const todayForecast = weatherData.daily[0] || null;

    return (
        <div className="min-h-screen w-full">
            <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="text-center mb-6">
                    <h1 className="text-5xl font-bold tracking-tight text-primary font-headline">WeatherEye</h1>
                </div>
                {error && <p className="text-center text-accent p-2 bg-accent/20 rounded-md">{error}</p>}
                
                <div className="animate-in fade-in-0 duration-500">
                    <CurrentWeather data={weatherData.current} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="animate-in fade-in-0 duration-700">
                      <AiSummary todayForecast={todayForecast} airQuality={weatherData.current.airQuality} />
                  </div>
                  <div className="animate-in fade-in-0 duration-700">
                      <AirQuality data={weatherData.current.airQuality} />
                  </div>
                </div>

                <div className="animate-in fade-in-0 duration-900">
                    <HourlyForecast data={weatherData.hourly} />
                </div>

                <div className="animate-in fade-in-0 duration-1000">
                    <DailyForecast data={weatherData.daily} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="animate-in fade-in-0 duration-1000">
                        <WeatherAlerts currentData={weatherData.current} />
                    </div>
                    <div className="animate-in fade-in-0 duration-1000 flex flex-col">
                        <Card className="flex-grow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <Leaf />
                                    Agricultural Guidance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center text-center h-full">
                                <p className="mb-4 text-muted-foreground">Get AI-powered advice on what to plant based on the weather forecast.</p>
                                <Button asChild>
                                    <Link href="/agriculture">
                                        View Agricultural Info
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
