'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Gauge, 
  Clock, 
  Route,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';
import { format } from 'date-fns';

interface VehiclePosition {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed: number;
  heading: number;
}

interface VehicleData {
  current: VehiclePosition;
  progress: number;
  totalDistance: number;
  currentIndex: number;
  totalPoints: number;
  isComplete: boolean;
}

interface VehicleDashboardProps {
  vehicleData: VehicleData | null;
  isLoading: boolean;
  isTracking: boolean;
  onToggleTracking: () => void;
  onReset: () => void;
}

export default function VehicleDashboard({
  vehicleData,
  isLoading,
  isTracking,
  onToggleTracking,
  onReset
}: VehicleDashboardProps) {
  const formatCoordinate = (coord: number, isLat: boolean) => {
    const direction = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  const getSpeedColor = (speed: number) => {
    if (speed < 30) return 'bg-green-500';
    if (speed < 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Vehicle Tracking System
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={onToggleTracking}
                variant={isTracking ? "destructive" : "default"}
                size="sm"
                className="font-medium"
              >
                {isTracking ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isTracking ? "default" : "secondary"} className="px-3 py-1">
              {isTracking ? "Live Tracking" : "Paused"}
            </Badge>
            {vehicleData && (
              <Badge variant="outline" className="px-3 py-1">
                Point {vehicleData.currentIndex + 1} of {vehicleData.totalPoints}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      {vehicleData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Route className="w-5 h-5 text-blue-500" />
              Route Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{vehicleData.progress}%</span>
              </div>
              <Progress value={vehicleData.progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Start</span>
                <span>{vehicleData.isComplete ? 'Complete!' : 'In Progress'}</span>
                <span>End</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Position Card */}
      {vehicleData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              Current Position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-600">Latitude</div>
                <div className="text-lg font-mono">
                  {formatCoordinate(vehicleData.current.latitude, true)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-600">Longitude</div>
                <div className="text-lg font-mono">
                  {formatCoordinate(vehicleData.current.longitude, false)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Metrics */}
      {vehicleData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Speed */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getSpeedColor(vehicleData.current.speed)}`}>
                  <Gauge className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{vehicleData.current.speed}</div>
                  <div className="text-sm text-gray-600">km/h</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heading */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500">
                  <Navigation 
                    className="w-5 h-5 text-white" 
                    style={{ transform: `rotate(${vehicleData.current.heading}deg)` }}
                  />
                </div>
                <div>
                  <div className="text-2xl font-bold">{vehicleData.current.heading}°</div>
                  <div className="text-sm text-gray-600">Heading</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500">
                  <Route className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{vehicleData.totalDistance}</div>
                  <div className="text-sm text-gray-600">meters</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Last Update */}
      {vehicleData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last updated: {format(new Date(vehicleData.current.timestamp), 'PPpp')}</span>
              {isLoading && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Updating...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}