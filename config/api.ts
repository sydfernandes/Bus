import { Languages } from "lucide-react";

export const API_CONFIG = {
  BASE_URL: 'https://api.ctan.es/v1',
  CONSORTIUM: '1',
  LANG: 'ES',
  MAP: {
    TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    DEFAULT_CENTER: [37.3886303, -5.9953403] as [number, number], // Seville
    DEFAULT_ZOOM: 15,
  },
  GEOCODING: {
    URL: 'https://nominatim.openstreetmap.org/reverse',
  },
} as const;

export const ENDPOINTS = {
  BUS_STOPS: (lat: number, long: number, maxdist: number = 500) => 
    `/Consorcios/${API_CONFIG.CONSORTIUM}/paradas?lat=${lat}&long=${long}&maxdist=${maxdist}&lang=${API_CONFIG.LANG}`,
  BUS_STOP_LINES: (stopId: string | number) =>
    `/Consorcios/${API_CONFIG.CONSORTIUM}/paradas/lineasPorParadas/${stopId}?lang=${API_CONFIG.LANG}`,
  BUS_LINE_DETAILS: (lineId: string | number) =>
    `/Consorcios/${API_CONFIG.CONSORTIUM}/lineas/${lineId}?lang=${API_CONFIG.LANG}`,
} as const;
