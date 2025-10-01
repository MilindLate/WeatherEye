'use client';

import type { CurrentWeather as CurrentWeatherType } from '@/lib/weather-data';
import WeatherIcon from './weather-icon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Droplets, Thermometer, Wind as WindIcon, MapPin } from 'lucide-react';

interface CurrentWeatherProps {
  data: CurrentWeatherType;
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
          <MapPin size={20} />
          {data.locationName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <WeatherIcon condition={data.condition} className="w-24 h-24 text-primary" />
            <div>
              <p className="text-6xl sm:text-7xl font-bold text-white">{Math.round(data.temp)}°</p>
              <p className="text-xl text-foreground/80 capitalize">{data.condition}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center w-full sm:w-auto">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50">
              <Thermometer size={24} className="text-primary" />
              <p className="font-bold">{Math.round(data.temp)}°C</p>
              <p className="text-xs text-muted-foreground">Temp</p>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50">
              <Droplets size={24} className="text-primary" />
              <p className="font-bold">{data.humidity}%</p>
              <p className="text-xs text-muted-foreground">Humidity</p>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50">
              <WindIcon size={24} className="text-primary" />
              <p className="font-bold">{data.wind} km/h</p>
              <p className="text-xs text-muted-foreground">Wind</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
