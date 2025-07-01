'use client';

import { useEffect, useRef, useState } from 'react';
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

// Custom car icon
const createCarIcon = (heading: number = 0) => {
  return L.divIcon({
    html: `
      <div style="transform: rotate(${heading}deg); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: 32px; 
          height: 32px; 
          background: linear-gradient(135deg, #EF4444, #DC2626);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
          border: 2px solid white;
          animation: carPulse 2s infinite;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      </div>
      <style>
        @keyframes carPulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
          }
          50% { 
            transform: scale(1.05); 
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.7);
          }
        }
      </style>
    `,
    className: 'car-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
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

// Component to handle map updates
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
  
  // Default center (Hyderabad)
  const defaultCenter: [number, number] = [17.385044, 78.486671];
  const center: [number, number] = currentPosition 
    ? [currentPosition.latitude, currentPosition.longitude]
    : defaultCenter;
  
  // Convert route to polyline coordinates
  const routeCoordinates: [number, number][] = route.map(point => [
    point.latitude,
    point.longitude
  ]);

  // Split route into completed and remaining parts
  const currentIndex = route.findIndex(point => 
    currentPosition && 
    point.latitude === currentPosition.latitude && 
    point.longitude === currentPosition.longitude
  );

  const completedRoute = currentIndex >= 0 ? routeCoordinates.slice(0, currentIndex + 1) : [];
  const remainingRoute = currentIndex >= 0 ? routeCoordinates.slice(currentIndex) : routeCoordinates;
  
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
      <MapContainer
        center={center}
        zoom={16}
        className="w-full h-full"
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Completed route (traveled path) - Green */}
        {completedRoute.length > 1 && (
          <Polyline
            positions={completedRoute}
            color="#10B981"
            weight={6}
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />
        )}
        
        {/* Remaining route (path to go) - Blue with animation */}
        {remainingRoute.length > 1 && (
          <Polyline
            positions={remainingRoute}
            color="#3B82F6"
            weight={5}
            opacity={0.8}
            dashArray="15, 10"
            lineCap="round"
            lineJoin="round"
            className="animate-pulse"
          />
        )}

        {/* Full route outline for better visibility */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#1F2937"
            weight={8}
            opacity={0.3}
            lineCap="round"
            lineJoin="round"
          />
        )}
        
        {/* Car marker */}
        {currentPosition && (
          <Marker
            position={[currentPosition.latitude, currentPosition.longitude]}
            icon={createCarIcon(currentPosition.heading)}
          />
        )}

        {/* Start point marker */}
        {routeCoordinates.length > 0 && (
          <Marker
            position={routeCoordinates[0]}
            icon={L.divIcon({
              html: `
                <div style="
                  width: 24px; 
                  height: 24px; 
                  background: #10B981;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L22 9L12 16L2 9L12 2Z"/>
                  </svg>
                </div>
              `,
              className: 'start-marker',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          />
        )}

        {/* End point marker */}
        {routeCoordinates.length > 0 && (
          <Marker
            position={routeCoordinates[routeCoordinates.length - 1]}
            icon={L.divIcon({
              html: `
                <div style="
                  width: 24px; 
                  height: 24px; 
                  background: #EF4444;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  </svg>
                </div>
              `,
              className: 'end-marker',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          />
        )}
        
        {/* Map updater component */}
        {currentPosition && <MapUpdater position={currentPosition} />}
      </MapContainer>
      
      {/* Map overlay with gradient border */}
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-white/20 bg-gradient-to-t from-black/5 via-transparent to-white/5" />
      
      {/* Route legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded"></div>
            <span className="text-gray-700">Traveled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded border-dashed border border-blue-300"></div>
            <span className="text-gray-700">Remaining</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            <span className="text-gray-700">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            <span className="text-gray-700">End</span>
          </div>
        </div>
      </div>
    </div>
  );
}