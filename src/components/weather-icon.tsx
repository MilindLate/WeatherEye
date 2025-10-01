'use client';

import type { WeatherCondition } from '@/lib/weather-data';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudRainWind,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  type LucideProps,
} from 'lucide-react';

interface WeatherIconProps extends LucideProps {
  condition: WeatherCondition;
}

const iconMap: Record<WeatherCondition, React.ElementType> = {
  Sunny: Sun,
  'Partly Cloudy': CloudSun,
  Cloudy: Cloud,
  Rainy: CloudRain,
  'Heavy Rain': CloudRainWind,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  Fog: CloudFog,
  Windy: Wind,
};

export default function WeatherIcon({ condition, ...props }: WeatherIconProps) {
  const IconComponent = iconMap[condition] || Sun;
  return <IconComponent {...props} />;
}
