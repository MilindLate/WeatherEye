'use client';

import type { DailyForecast as DailyForecastType } from '@/lib/weather-data';
import WeatherIcon from './weather-icon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DailyForecastProps {
  data: DailyForecastType[];
}

export default function DailyForecast({ data }: DailyForecastProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calendar />
          7-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <ul className="space-y-4">
            {data.map((day, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-4 p-2 -mx-2 rounded-lg transition-colors hover:bg-muted/50"
              >
                <p className="font-semibold w-16">{day.day}</p>
                <Tooltip>
                  <TooltipTrigger>
                    <WeatherIcon icon={day.icon} className="w-8 h-8 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{day.condition}</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex-1 flex items-center justify-end gap-2 text-sm">
                  <p className="text-foreground/80 w-10 text-right">{Math.round(day.temp.min)}°</p>
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                      style={{
                        width: `100%`,
                      }}
                    />
                  </div>
                  <p className="font-bold text-foreground w-10">{Math.round(day.temp.max)}°</p>
                </div>
              </li>
            ))}
          </ul>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
