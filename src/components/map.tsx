'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default icons can break with webpack. This is a common workaround.
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});


export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Initialize map only if the ref is set and a map instance doesn't already exist.
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
      });

      const cartoDbTileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      L.tileLayer(cartoDbTileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(mapInstanceRef.current);
      
      const aqicnToken = process.env.NEXT_PUBLIC_AQICN_API_TOKEN;
      if (aqicnToken) {
        const aqiTileUrl = `https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${aqicnToken}`;
        L.tileLayer(aqiTileUrl, {
          attribution: '&copy; <a href="https://waqi.info/">waqi.info</a>',
        }).addTo(mapInstanceRef.current);
      } else {
        console.warn("NEXT_PUBLIC_AQICN_API_TOKEN not found. Air quality map layer will not be displayed.");
      }
    }

    // Cleanup function to destroy the map instance when the component unmounts.
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once.

  return (
    <div 
      ref={mapRef} 
      style={{ height: '100%', width: '100%', backgroundColor: 'hsl(var(--background))' }}
    />
  );
}
