'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import VehicleDashboard from '@/components/vehicle-dashboard';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const VehicleMap = dynamic(() => import('@/components/vehicle-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface VehiclePosition {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed: number;
  heading: number;
}

interface VehicleData {
  current: VehiclePosition;
  next: VehiclePosition;
  route: VehiclePosition[];
  progress: number;
  totalDistance: number;
  currentIndex: number;
  totalPoints: number;
  isComplete: boolean;
}

export default function Home() {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(true);

  const fetchVehicleData = useCallback(async () => {
    if (!isTracking) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/vehicle');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setVehicleData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle data');
      console.error('Error fetching vehicle data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isTracking]);

  const resetSimulation = async () => {
    try {
      await fetch('/api/vehicle', { method: 'POST' });
      setVehicleData(null);
      if (isTracking) {
        fetchVehicleData();
      }
    } catch (err) {
      setError('Failed to reset simulation');
      console.error('Error resetting simulation:', err);
    }
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  // Fetch data on component mount and set up interval
  useEffect(() => {
    fetchVehicleData();
  }, [fetchVehicleData]);

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(fetchVehicleData, 3000);
    return () => clearInterval(interval);
  }, [fetchVehicleData, isTracking]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-screen max-h-screen">
          {/* Left Sidebar - Dashboard */}
          <div className="xl:col-span-1 space-y-6 overflow-y-auto max-h-screen pb-20">
            <VehicleDashboard
              vehicleData={vehicleData}
              isLoading={isLoading}
              isTracking={isTracking}
              onToggleTracking={toggleTracking}
              onReset={resetSimulation}
            />
          </div>

          {/* Right Panel - Map */}
          <div className="xl:col-span-2 flex flex-col">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <Card className="flex-1 p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="h-full min-h-[600px]">
                <VehicleMap
                  currentPosition={vehicleData?.current || null}
                  route={vehicleData?.route || []}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}