'use client';

import { useState, useEffect } from 'react';
import type { WeatherData } from '@/lib/weather-data';
import CurrentWeather from './current-weather';
import HourlyForecast from './hourly-forecast';
import DailyForecast from './daily-forecast';
import AiSummary from './ai-summary';
import AirQuality from './air-quality';
import { Button } from './ui/button';
import { Leaf, Globe, Siren, MapPin } from 'lucide-react';
import { getRealtimeWeatherData } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';

function NavCard({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) {
    return (
         <Link href={href} className="block transition-transform hover:scale-[1.02]">
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        {icon}
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold">{title}</CardTitle>
                        <CardDescription className="text-xs">{description}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    )
}

interface WeatherAppProps {
    location: { lat: number, lon: number } | { city: string } | null;
}

export default function WeatherApp({ location }: WeatherAppProps) {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchWeather = async () => {
            if (!location) {
                // If no location is provided in URL, redirect to location selection
                router.push('/location');
                return;
            }

            setLoading(true);
            
            try {
                const data = await getRealtimeWeatherData(location);
                
                if (data) {
                    setWeatherData(data);
                    setError(null);
                    if ('city' in location) {
                         localStorage.setItem('weather_location_city', location.city);
                         localStorage.removeItem('weather_location_coords');
                    } else {
                        localStorage.setItem('weather_location_coords', JSON.stringify({lat: location.lat, lon: location.lon}));
                        localStorage.removeItem('weather_location_city');
                    }
                } else {
                    setError(`Could not fetch weather data. Try another location.`);
                }
            } catch (err: any) {
                console.error("Weather fetch error:", err);
                setError(`Failed to fetch weather data. Please try changing the location.`);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [location, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold text-primary mb-2 animate-pulse">WeatherEye</h1>
                <p className="text-muted-foreground animate-pulse">Fetching the latest forecast...</p>
            </div>
        );
    }
    
    if (error || !weatherData) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
            <p className="text-destructive">{error || "Could not load weather data."}</p>
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
                
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <NavCard 
                        href="/agriculture"
                        icon={<Leaf size={20}/>}
                        title="Agricultural Guidance"
                        description="AI crop advice"
                    />
                    <NavCard 
                        href="/alerts"
                        icon={<Globe size={20}/>}
                        title="Global Red Alerts"
                        description="Severe weather worldwide"
                    />
                     <NavCard 
                        href="/emergency"
                        icon={<Siren size={20}/>}
                        title="Emergency Assistance"
                        description="Immediate safety guide"
                    />
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
            </div>
        </div>
    );
}
