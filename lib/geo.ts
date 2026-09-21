/**
 * Small lookup of cities the prototype understands. Distances are computed
 * between city centres with the haversine formula - good enough for a
 * "near you" indicator, not for navigation.
 */
const CITY_COORDS: Record<string, [number, number]> = {
  Faridabad: [28.4089, 77.3178],
  Delhi: [28.6139, 77.209],
  Gurugram: [28.4595, 77.0266],
  Noida: [28.5355, 77.391],
  "Greater Noida": [28.4744, 77.504],
  Ghaziabad: [28.6692, 77.4538],
  Sonipat: [28.9288, 77.0915],
  Meerut: [28.9845, 77.7064],
  Rohtak: [28.8955, 76.6066],
  Panchkula: [30.6942, 76.8606],
  Chandigarh: [30.7333, 76.7794],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Mumbai: [19.076, 72.8777],
  Pune: [18.5204, 73.8567],
  Bengaluru: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Ahmedabad: [23.0225, 72.5714],
};

export const CITIES = Object.keys(CITY_COORDS).sort();

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function distanceBetween(cityA: string, cityB: string): number | undefined {
  const a = CITY_COORDS[cityA];
  const b = CITY_COORDS[cityB];
  if (!a || !b) return undefined;
  if (cityA === cityB) return 0;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export function distanceLabel(km: number | undefined, sameCity: boolean): string | undefined {
  if (sameCity) return "In your city";
  if (km === undefined) return undefined;
  return `${km} km away`;
}
