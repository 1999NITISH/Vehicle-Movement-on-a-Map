'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCarIcon = (heading: number = 0) => {
  const div = document.createElement('div');
  div.className = `w-10 h-10 flex items-center justify-center transform rotate-[${heading}deg]`;
  div.innerHTML = `
    <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center border-2 border-white shadow-lg animate-carPulse">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    </div>
  `;
  return L.divIcon({ html: div.outerHTML, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
};

interface VehiclePosition {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed: number;
  heading: number;
}

interface VehicleMapProps {
  currentPosition: VehiclePosition | null;
  route: VehiclePosition[];
}

function MapUpdater({ position }: { position: VehiclePosition | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.latitude, position.longitude], 16, { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function VehicleMap({ currentPosition, route }: VehicleMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const defaultCenter: [number, number] = [17.385044, 78.486671];
  const center: [number, number] = currentPosition ? [currentPosition.latitude, currentPosition.longitude] : defaultCenter;

  const routeCoordinates: [number, number][] = route.map(p => [p.latitude, p.longitude]);
  const currentIndex = route.findIndex(p => currentPosition && p.latitude === currentPosition.latitude && p.longitude === currentPosition.longitude);
  const completedRoute = currentIndex >= 0 ? routeCoordinates.slice(0, currentIndex + 1) : [];
  const remainingRoute = currentIndex >= 0 ? routeCoordinates.slice(currentIndex) : routeCoordinates;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
      <MapContainer center={center} zoom={16} className="w-full h-full" ref={setMap}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {completedRoute.length > 1 && <Polyline positions={completedRoute} color="#10B981" weight={6} opacity={0.9} />}
        {remainingRoute.length > 1 && <Polyline positions={remainingRoute} color="#3B82F6" weight={5} opacity={0.8} dashArray="15,10" className="animate-pulse" />}
        {routeCoordinates.length > 1 && <Polyline positions={routeCoordinates} color="#1F2937" weight={8} opacity={0.3} />}
        {currentPosition && <Marker position={[currentPosition.latitude, currentPosition.longitude]} icon={createCarIcon(currentPosition.heading)} />}
        {routeCoordinates.length > 0 && (
          <Marker position={routeCoordinates[0]} icon={L.divIcon({
            html: `<div class='w-6 h-6 bg-green-500 rounded-full border-2 border-white'></div>`,
            className: '', iconSize: [24, 24], iconAnchor: [12, 12]
          })} />
        )}
        {routeCoordinates.length > 0 && (
          <Marker position={routeCoordinates[routeCoordinates.length - 1]} icon={L.divIcon({
            html: `<div class='w-6 h-6 bg-red-500 rounded-full border-2 border-white'></div>`,
            className: '', iconSize: [24, 24], iconAnchor: [12, 12]
          })} />
        )}
        {currentPosition && <MapUpdater position={currentPosition} />}
      </MapContainer>
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-white/20 bg-gradient-to-t from-black/5 via-transparent to-white/5" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-sm space-y-2">
        <div className="flex items-center gap-2"><div className="w-4 h-1 bg-green-500 rounded" />Traveled</div>
        <div className="flex items-center gap-2"><div className="w-4 h-1 bg-blue-500 rounded border border-blue-300 border-dashed" />Remaining</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />Start</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white" />End</div>
      </div>
    </div>
  );
}
