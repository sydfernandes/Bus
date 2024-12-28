// Haversine formula to calculate distance between two points on Earth

interface Point {
  lat: number;
  lon: number;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param point1 First point with latitude and longitude
 * @param point2 Second point with latitude and longitude
 * @returns Distance in meters
 */
export function getDistance(point1: Point, point2: Point): number {
  console.log('📏 Calculating distance between points:', {
    point1,
    point2
  });

  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lon - point1.lon) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  console.log('📏 Calculated distance:', formatDistance(distance));
  return Math.round(distance); // Return distance in meters
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
