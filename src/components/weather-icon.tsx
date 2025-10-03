'use client';

import type { WeatherIconType } from '@/lib/weather-data';
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
  icon: WeatherIconType;
}

const iconMap: Record<WeatherIconType, React.ElementType> = {
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

export default function WeatherIcon({ icon, ...props }: WeatherIconProps) {
  const IconComponent = iconMap[icon] || Sun;
  return <IconComponent {...props} />;
}
