'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LocationPage() {
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleCitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
            setLoading(true);
            router.push(`/dashboard?city=${encodeURIComponent(city.trim())}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary font-headline">Welcome to WeatherEye</CardTitle>
                    <CardDescription>Enter a city to get the forecast</CardDescription>
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
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || !city.trim()}>
                            {loading ? 'Loading...' : 'Get Weather'}
                            {!loading && <Navigation className="ml-2" />}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                     <p className="text-xs text-muted-foreground text-center w-full">We'll use your location to provide an accurate weather forecast.</p>
                </CardFooter>
            </Card>
        </div>
    );
}
