'use client';

import type { AirQuality as AirQualityType } from '@/lib/weather-data';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Gauge } from 'lucide-react';

interface AirQualityProps {
  data: AirQualityType;
}

const getAqiInfo = (aqi: number): { level: string; color: string; message: string } => {
  if (aqi <= 50) return { level: 'Good', color: 'text-green-500', message: 'Air quality is considered satisfactory.' };
  if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-500', message: 'Some pollutants may be a concern for sensitive people.' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-500', message: 'Members of sensitive groups may experience health effects.' };
  if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-500', message: 'Everyone may begin to experience health effects.' };
  if (aqi <= 300) return { level: 'Very Unhealthy', color: 'text-purple-500', message: 'Health warnings of emergency conditions.' };
  return { level: 'Hazardous', color: 'text-red-700', message: 'The entire population is more likely to be affected.' };
};

export default function AirQuality({ data }: AirQualityProps) {
  const aqiInfo = getAqiInfo(data.aqi);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Gauge />
          Air Quality & Pollutants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Air Quality Index (AQI)</p>
            <p className={`text-3xl font-bold ${aqiInfo.color}`}>{data.aqi}</p>
            <p className={`font-semibold ${aqiInfo.color}`}>{aqiInfo.level}</p>
          </div>
          <p className="text-sm text-right max-w-[180px]">{aqiInfo.message}</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
            <Pollutant name="PM2.5" value={data.pm25} unit="μg/m³" />
            <Pollutant name="PM10" value={data.pm10} unit="μg/m³" />
            <Pollutant name="SO₂" value={data.so2} unit="μg/m³" />
            <Pollutant name="NO₂" value={data.no2} unit="μg/m³" />
            <Pollutant name="O₃" value={data.o3} unit="μg/m³" />
            <Pollutant name="CO" value={data.co} unit="mg/m³" />
        </div>
      </CardContent>
    </Card>
  );
}

function Pollutant({ name, value, unit }: { name: string, value: number, unit: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50">
            <p className="text-xs text-muted-foreground">{name}</p>
            <p className="font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
    )
}
