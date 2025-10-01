'use client';

import type { HourlyForecast as HourlyForecastType } from '@/lib/weather-data';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Clock } from 'lucide-react';

interface HourlyForecastProps {
  data: HourlyForecastType[];
}

const chartConfig = {
  temperature: {
    label: 'Temp (°C)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function HourlyForecast({ data }: HourlyForecastProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Clock />
          Hourly Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 2)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}°`}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorTemp)"
              strokeWidth={2}
              name="Temperature"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
