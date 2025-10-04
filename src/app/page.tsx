'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // On first load, check if there's a location saved from a previous session
    const city = localStorage.getItem('weather_location_city');
    const coordsRaw = localStorage.getItem('weather_location_coords');

    if (city) {
      router.replace(`/dashboard?city=${city}`);
    } else if (coordsRaw) {
      try {
        const coords = JSON.parse(coordsRaw);
        router.replace(`/dashboard?lat=${coords.lat}&lon=${coords.lon}`);
      } catch (e) {
         router.replace('/location');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}
