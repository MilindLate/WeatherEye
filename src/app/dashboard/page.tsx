'use client';

import { Suspense } from 'react';
import WeatherApp from '@/components/weather-app';
import { useSearchParams } from 'next/navigation';

function DashboardContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  let location: { city: string } | { lat: number; lon: number } | null = null;

  if (city) {
    location = { city };
  } else if (lat && lon) {
    location = { lat: parseFloat(lat), lon: parseFloat(lon) };
  }

  return <WeatherApp location={location} />;
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
