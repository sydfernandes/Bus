import { Languages } from "lucide-react";

export const API_CONFIG = {
  CTAN: {
    BaseUrl: 'https://api.ctan.es/v1',
    Consortium: '1',
    Lang: 'ES',
  },
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
  BUS_STOPS: (lat: number, long: number) => 
    `${API_CONFIG.CTAN.BaseUrl}/Consorcios/${API_CONFIG.CTAN.Consortium}/paradas?latitud=${lat}&longitud=${long}&lang=${API_CONFIG.CTAN.Lang}`,
  
  BUS_STOP_LINES: (stopId: string | number) =>
    `${API_CONFIG.CTAN.BaseUrl}/Consorcios/${API_CONFIG.CTAN.Consortium}/paradas/lineasPorParadas/${stopId}?lang=${API_CONFIG.CTAN.Lang}`,
} as const;
