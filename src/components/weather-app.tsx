'use client';

import { useState, useEffect, useTransition } from 'react';
import type { WeatherData } from '@/lib/weather-data';
import CurrentWeather from './current-weather';
import HourlyForecast from './hourly-forecast';
import DailyForecast from './daily-forecast';
import AiSummary from './ai-summary';
import AirQuality from './air-quality';
import { Button } from './ui/button';
import Link from 'next/link';
import { Leaf, ShieldAlert, Siren, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getRealtimeWeatherData } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function WeatherApp() {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        const savedLocation = localStorage.getItem('weather_location');
        
        if (savedLocation) {
             startTransition(async () => {
                const data = await getRealtimeWeatherData({ city: savedLocation });
                if (data) {
                    setWeatherData(data);
                    setError(null);
                } else {
                    setError(`Could not fetch weather data for ${savedLocation}. Try another location.`);
                    localStorage.removeItem('weather_location'); // Clear invalid location
                }
                setLoading(false);
            });
        } else if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    startTransition(async () => {
                        const data = await getRealtimeWeatherData({ lat: latitude, lon: longitude });
                        if (data) {
                            setWeatherData(data);
                            setError(null);
                        } else {
                            setError("Could not fetch weather data for your location.");
                        }
                        setLoading(false);
                    });
                },
                (err) => {
                     startTransition(async () => {
                        setError(`Error getting location: ${err.message}. Please select a location manually.`);
                        setLoading(false);
                     });
                }
            );
        } else {
            startTransition(() => {
                setError("Geolocation is not supported. Please select a location manually.");
                setLoading(false);
            });
        }
    }, []);

    if (loading || isPending) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold text-primary mb-2 animate-pulse">WeatherEye</h1>
                <p className="text-muted-foreground animate-pulse">Fetching the latest forecast for your location...</p>
            </div>
        );
    }
    
    if (!weatherData) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <p className="text-destructive text-center">{error || "Could not load weather data."}</p>
            <Button onClick={() => router.push('/location')}>
                <MapPin className="mr-2" />
                Select a Location
            </Button>
          </div>
        );
    }

    const todayForecast = weatherData.daily[0] || null;

    return (
        <div className="min-h-screen w-full">
            <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-5xl font-bold tracking-tight text-primary font-headline">WeatherEye</h1>
                    <Button variant="outline" size="sm" onClick={() => router.push('/location')}>
                        <MapPin className="mr-2"/>
                        Change Location
                    </Button>
                </div>
                
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
                       <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <Leaf />
                                    Agricultural Guidance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-start justify-center text-left h-full">
                                <p className="mb-4 text-muted-foreground text-sm">Get AI-powered advice on what to plant based on the weather forecast.</p>
                                <Button asChild size="sm">
                                    <Link href="/agriculture">
                                        View Agricultural Info
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="animate-in fade-in-0 duration-1000">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <ShieldAlert />
                                    Global Red Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-start justify-center text-left h-full">
                                <p className="mb-4 text-muted-foreground text-sm">View severe weather warnings from around the world.</p>
                                <Button asChild size="sm">
                                    <Link href="/alerts">
                                        View Global Alerts
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="animate-in fade-in-0 duration-1000 md:col-span-2">
                        <Card className="border-destructive/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-destructive">
                                    <Siren />
                                    Emergency Assistance
                                </CardTitle>
                            </Header>
                            <CardContent className="flex flex-col items-start justify-center text-left h-full">
                                <p className="mb-4 text-muted-foreground">Get safety tips and emergency contact numbers for severe weather situations.</p>
                                <Button asChild variant="destructive">
                                    <Link href="/emergency">
                                        Get Help Now
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
