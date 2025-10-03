'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, LocateFixed } from "lucide-react";

export default function LocationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [city, setCity] = useState('');

    const handleUseCurrentLocation = () => {
        setLoading(true);
        setError('');
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    localStorage.removeItem('weather_location');
                    router.push('/dashboard');
                },
                (err) => {
                    setError('Could not get your location. Please try again or search manually.');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not available in your browser.');
            setLoading(false);
        }
    };
    
    const handleLocationSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
            localStorage.setItem('weather_location', city.trim());
            router.push('/dashboard');
        } else {
            setError('Please enter a city name.');
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <MapPin className="text-primary" />
                        Select Your Location
                    </CardTitle>
                    <CardDescription>
                        We need your location to show you the weather forecast.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button onClick={handleUseCurrentLocation} disabled={loading} className="w-full" size="lg">
                        <LocateFixed className="mr-2" />
                        {loading ? 'Getting Location...' : 'Use Current Location'}
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <form onSubmit={handleLocationSearch} className="space-y-4">
                        <div className="space-y-2">
                             <Input
                                id="location-search"
                                type="text"
                                placeholder="Search for a city..."
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Search Location
                        </Button>
                    </form>
                    {error && <p className="text-sm text-center text-destructive mt-4">{error}</p>}
                </CardContent>
            </Card>
        </div>
    );
}
