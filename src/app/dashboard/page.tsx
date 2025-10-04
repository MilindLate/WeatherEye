'use client';

import { Suspense } from 'react';
import WeatherApp from '@/components/weather-app';

function DashboardContent() {
  // Set a default location since we are bypassing the location selection
  const location = { city: 'London' };

  return <WeatherApp location={location} />;
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
