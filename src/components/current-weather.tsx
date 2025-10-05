'use client';

import type { CurrentWeather as CurrentWeatherType, DailyForecast } from '@/lib/weather-data';
import WeatherIcon from './weather-icon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Droplets, Thermometer, Wind as WindIcon, MapPin, Gauge } from 'lucide-react';

interface CurrentWeatherProps {
  data: CurrentWeatherType;
  todayForecast: DailyForecast | null;
}

export default function CurrentWeather({ data, todayForecast }: CurrentWeatherProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
          <MapPin size={20} />
          {data.locationName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <WeatherIcon icon={data.icon} className="w-24 h-24 text-primary" />
            <div>
              <p className="text-6xl sm:text-7xl font-bold text-white">{Math.round(data.temp)}°</p>
              <p className="text-lg text-foreground/80">{data.condition}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center w-full sm:w-auto">
            <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50">
              <Thermometer size={20} className="text-primary" />
              <p className="font-bold text-sm">{Math.round(data.feelsLike)}°C</p>
              <p className="text-xs text-muted-foreground">Feels Like</p>
            </div>
             <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50">
                <p className="font-bold text-sm">{todayForecast ? `${Math.round(todayForecast.temp.max)}°/${Math.round(todayForecast.temp.min)}°` : '--'}</p>
                <p className="text-xs text-muted-foreground">Max / Min</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50">
              <Droplets size={20} className="text-primary" />
              <p className="font-bold text-sm">{data.humidity}%</p>
              <p className="text-xs text-muted-foreground">Humidity</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50">
              <WindIcon size={20} className="text-primary" />
              <p className="font-bold text-sm">{data.wind} km/h</p>
              <p className="text-xs text-muted-foreground">Wind</p>
            </div>
             <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50">
              <Gauge size={20} className="text-primary" />
              <p className="font-bold text-sm">{data.pressure} hPa</p>
              <p className="text-xs text-muted-foreground">Pressure</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
