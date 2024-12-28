/**
 * Format a distance in meters to a human-readable string
 * @param meters Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 100) {
    return `${Math.round(meters)}m`;
  } else if (meters < 1000) {
    return `${Math.round(meters / 10) * 10}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}
