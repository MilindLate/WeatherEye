'use client'

import { useEffect, useState, useTransition } from 'react';
import { getAiSummary } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyForecast, AirQuality } from '@/lib/weather-data';
import { Skeleton } from './ui/skeleton';
import { Bot } from 'lucide-react';

export default function AiSummary({ todayForecast, airQuality }: { todayForecast: DailyForecast | null, airQuality: AirQuality | null }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (todayForecast && airQuality) {
      startTransition(async () => {
        const input = {
          temperatureHigh: todayForecast.temp.max,
          temperatureLow: todayForecast.temp.min,
          condition: todayForecast.condition,
          precipitationProbability: todayForecast.precipitation,
          windSpeed: todayForecast.wind,
          airQualityIndex: airQuality.aqi,
        };
        const result = await getAiSummary(input);
        setSummary(result);
      });
    }
  }, [todayForecast, airQuality]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bot />
          AI Daily Brief
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPending || !summary ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <p className="text-foreground/90 italic">{summary}</p>
        )}
      </CardContent>
    </Card>
  );
}
