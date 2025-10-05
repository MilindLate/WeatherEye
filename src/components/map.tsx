
'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getMapData } from '@/app/actions';
import L from 'leaflet';

interface Station {
  lat: number;
  lon: number;
  uid: number;
  aqi: string;
  station: {
    name: string;
    time: string;
  };
}

const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return '#009966'; // Good
  if (aqi <= 100) return '#FFDE33'; // Moderate
  if (aqi <= 150) return '#FF9933'; // Unhealthy for Sensitive
  if (aqi <= 200) return '#CC0033'; // Unhealthy
  if (aqi <= 300) return '#660099'; // Very Unhealthy
  return '#7E0023'; // Hazardous
};

function MapMarkers({ stations }: { stations: Station[] }) {
  return (
    <>
      {stations.map((station) => {
        const aqi = parseInt(station.aqi, 10);
        if (isNaN(aqi) || station.lat === null || station.lon === null) {
          return null;
        }

        return (
          <CircleMarker
            key={station.uid}
            center={[station.lat, station.lon]}
            radius={8}
            pathOptions={{
              color: getAqiColor(aqi),
              fillColor: getAqiColor(aqi),
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-base">{station.station.name}</p>
                <p className="font-bold text-lg" style={{ color: getAqiColor(aqi) }}>
                  AQI: {aqi}
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(station.station.time).toLocaleString()}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}


export default function Map() {
  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getMapData();
        setStations(data);
      } catch (err) {
        setError("Could not load map data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full bg-muted animate-pulse">Loading map data...</div>;
  }
  
  if (error) {
     return <div className="flex items-center justify-center h-full bg-destructive/10 text-destructive">{error}</div>;
  }

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', backgroundColor: 'hsl(var(--background))' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapMarkers stations={stations} />
    </MapContainer>
  );
}
