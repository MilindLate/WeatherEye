'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  const aqicnToken = "60e070c43d591a83382cc47153b75b155a4302ad";
  const aqiTileUrl = `https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${aqicnToken}`;
  const cartoDbTileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2} 
      style={{ height: '100%', width: '100%', backgroundColor: 'hsl(var(--background))' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={cartoDbTileUrl}
      />
      <TileLayer
        attribution='&copy; <a href="https://waqi.info/">waqi.info</a>'
        url={aqiTileUrl}
      />
    </MapContainer>
  );
}
