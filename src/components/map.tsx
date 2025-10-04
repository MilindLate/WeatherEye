'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

export default function Map() {
  const position: LatLngExpression = [20, 0]; // Center of the world

  return (
    <MapContainer
      center={position}
      zoom={2}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* We will add data markers here later */}
       <Marker position={[51.505, -0.09]}>
        <Popup>
          A sample marker. <br /> We'll populate this with real data soon.
        </Popup>
      </Marker>
    </MapContainer>
  );
}
