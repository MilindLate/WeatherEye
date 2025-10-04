'use client';

import { useState, useEffect } from 'react';
import type { WeatherData } from '@/lib/weather-data';
import CurrentWeather from './current-weather';
import HourlyForecast from './hourly-forecast';
import DailyForecast from './daily-forecast';
import AiSummary from './ai-summary';
import AirQuality from './air-quality';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import { getRealtimeWeatherData } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function WeatherApp() {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            const savedLocation = localStorage.getItem('weather_location');
            
            let data: WeatherData | null = null;

            try {
                if (savedLocation) {
                    data = await getRealtimeWeatherData({ city: savedLocation });
                    if (!data) {
                        setError(`Could not fetch weather data for ${savedLocation}. Try another location.`);
                        localStorage.removeItem('weather_location'); // Clear invalid location
                    }
                } else if ('geolocation' in navigator) {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    const { latitude, longitude } = position.coords;
                    data = await getRealtimeWeatherData({ lat: latitude, lon: longitude });
                    if (!data) {
                        setError("Could not fetch weather data for your location.");
                    }
                } else {
                    setError("Geolocation is not supported. Please select a location manually.");
                }

                if (data) {
                    setWeatherData(data);
                    setError(null);
                }
            } catch (err: any) {
                setError(`Error: ${err.message}. Please select a location manually.`);
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold text-primary mb-2 animate-pulse">WeatherEye</h1>
                <p className="text-muted-foreground animate-pulse">Fetching the latest forecast for your location...</p>
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
