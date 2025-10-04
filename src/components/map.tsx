'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { Card, CardContent } from './ui/card';

export default function Map() {
  const position: LatLngExpression = [20, 0]; // Center of the world
  const token = process.env.NEXT_PUBLIC_AQICN_API_TOKEN;
  const waqiUrl = `https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${token}`;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={position}
        zoom={2}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {token && token !== "your_token_here" ? (
          <TileLayer
            url={waqiUrl}
            attribution='&copy; <a href="http://waqi.info">waqi.info</a>'
          />
        ) : (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]">
                 <Card className="max-w-sm">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-2">Air Quality Layer Not Visible</h3>
                        <p className="text-sm text-muted-foreground">
                            To see the real-time air quality data on this map, you need to add an API token from the World Air Quality Index project.
                        </p>
                         <ol className="list-decimal list-inside text-sm mt-4 space-y-1">
                            <li>Visit <a href="https://aqicn.org/data-platform/token/" target="_blank" rel="noopener noreferrer" className="text-primary underline">aqicn.org</a> to get a free token.</li>
                            <li>Open the <code className="bg-muted p-1 rounded-sm">.env</code> file in your project.</li>
                            <li>Replace <code className="bg-muted p-1 rounded-sm">"your_token_here"</code> with your new token.</li>
                        </ol>
                    </CardContent>
                 </Card>
            </div>
        )}
      </MapContainer>
    </div>
  );
}
