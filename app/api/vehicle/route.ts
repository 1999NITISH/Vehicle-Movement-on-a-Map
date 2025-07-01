import { NextResponse } from 'next/server';
import vehicleData from '@/data/vehicle-route.json';

let currentIndex = 0;
let startTime = Date.now();

export async function GET() {
  try {
    // Calculate which data point we should be at based on time elapsed
    const timeElapsed = Math.floor((Date.now() - startTime) / 3000); // 3 second intervals
    currentIndex = timeElapsed % vehicleData.length;
    
    // Get current position and next few positions for smooth interpolation
    const currentPosition = vehicleData[currentIndex];
    const nextPosition = vehicleData[(currentIndex + 1) % vehicleData.length];
    const route = vehicleData.slice(0, currentIndex + 1);
    
    // Calculate progress percentage
    const progress = ((currentIndex + 1) / vehicleData.length) * 100;
    
    // Calculate total distance traveled (simplified)
    let totalDistance = 0;
    for (let i = 1; i <= currentIndex; i++) {
      const prev = vehicleData[i - 1];
      const curr = vehicleData[i];
      totalDistance += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    }
    
    return NextResponse.json({
      current: currentPosition,
      next: nextPosition,
      route: route,
      progress: Math.round(progress),
      totalDistance: Math.round(totalDistance * 1000), // Convert to meters
      currentIndex: currentIndex,
      totalPoints: vehicleData.length,
      isComplete: currentIndex >= vehicleData.length - 1
    });
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle data' },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Reset the simulation
  startTime = Date.now();
  currentIndex = 0;
  
  return NextResponse.json({ message: 'Simulation reset successfully' });
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}