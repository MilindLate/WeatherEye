'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LocateFixed, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LocationPage() {
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleCitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
            setLoading(true);
            router.push(`/dashboard?city=${encodeURIComponent(city.trim())}`);
        }
    };

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            toast({
                variant: 'destructive',
                title: 'Geolocation Not Supported',
                description: 'Your browser does not support geolocation.',
            });
            return;
        }

        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                router.push(`/dashboard?lat=${latitude}&lon=${longitude}`);
            },
            (error) => {
                setGeoLoading(false);
                toast({
                    variant: 'destructive',
                    title: 'Geolocation Error',
                    description: error.message || 'Could not get your location. Please enter a city manually.',
                });
            }
        );
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary font-headline">Welcome to WeatherEye</CardTitle>
                    <CardDescription>Select your location to get the forecast</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCitySubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City Name</Label>
                            <Input
                                id="city"
                                placeholder="e.g., New York, London, Tokyo"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                disabled={loading || geoLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || geoLoading || !city.trim()}>
                            {loading && !geoLoading ? 'Loading...' : 'Get Weather'}
                            {!loading && <Navigation className="ml-2" />}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <Separator />
                        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-xs text-muted-foreground">OR</span>
                    </div>

                     <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGeolocation}
                        disabled={loading || geoLoading}
                    >
                        {geoLoading ? 'Finding you...' : 'Use My Current Location'}
                        {!geoLoading && <LocateFixed className="ml-2" />}
                    </Button>

                </CardContent>
                <CardFooter>
                     <p className="text-xs text-muted-foreground text-center w-full">We'll use your location to provide an accurate weather forecast.</p>
                </CardFooter>
            </Card>
        </div>
    );
}
