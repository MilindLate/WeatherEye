'use client';

import { useEffect, useState } from 'react';
import { Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { fetchAirQuality } from '@/lib/fetch-airquality';

interface PollutantData {
  concentration: number;
  aqi: number;
}

interface AirQualityType {
  overall_aqi: number;
  PM2_5: PollutantData;
  PM10: PollutantData;
  SO2: PollutantData;
  NO2: PollutantData;
  O3: PollutantData;
  CO: PollutantData;
}

const getAqiInfo = (aqi: number) => {
  if (aqi <= 50) return { level: 'Good', color: 'text-green-500', message: 'Air quality is considered satisfactory.' };
  if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-500', message: 'Some pollutants may be a concern for sensitive people.' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-500', message: 'Members of sensitive groups may experience health effects.' };
  if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-500', message: 'Everyone may begin to experience health effects.' };
  if (aqi <= 300) return { level: 'Very Unhealthy', color: 'text-purple-500', message: 'Health warnings of emergency conditions.' };
  return { level: 'Hazardous', color: 'text-red-700', message: 'The entire population is more likely to be affected.' };
};

export default function AirQuality() {
  const [data, setData] = useState<AirQualityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAirQuality("Pune")
      .then((d) => {
        setData({
          overall_aqi: d.overall_aqi,
          PM2_5: d['PM2.5'],
          PM10: d.PM10,
          SO2: d.SO2,
          NO2: d.NO2,
          O3: d.O3,
          CO: d.CO,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading air quality data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!data) return null;

  const aqiInfo = getAqiInfo(data.overall_aqi);

  const pollutants = [
    { name: 'PM2.5', data: data.PM2_5, unit: 'μg/m³' },
    { name: 'PM10', data: data.PM10, unit: 'μg/m³' },
    { name: 'SO₂', data: data.SO2, unit: 'μg/m³' },
    { name: 'NO₂', data: data.NO2, unit: 'μg/m³' },
    { name: 'O₃', data: data.O3, unit: 'μg/m³' },
    { name: 'CO', data: data.CO, unit: 'μg/m³' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Gauge /> Air Quality & Pollutants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Overall Air Quality Index (AQI)</p>
            <p className={`text-3xl font-bold ${aqiInfo.color}`}>{data.overall_aqi}</p>
            <p className={`font-semibold ${aqiInfo.color}`}>{aqiInfo.level}</p>
          </div>
          <p className="text-sm text-right max-w-[180px]">{aqiInfo.message}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {pollutants.map((p) => (
            <Pollutant key={p.name} name={p.name} data={p.data} unit={p.unit} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Pollutant({ name, data, unit }: { name: string; data: PollutantData; unit: string }) {
  const aqiInfo = getAqiInfo(data.aqi);
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-background/50 border">
      <p className="text-sm font-semibold text-muted-foreground">{name}</p>
      <p className="font-bold text-lg">{data.concentration}</p>
      <p className="text-xs text-muted-foreground">{unit}</p>
      <p className={`text-xs font-bold mt-1 ${aqiInfo.color}`}>(AQI: {data.aqi})</p>
    </div>
  );
}
