import { NextResponse, NextRequest } from 'next/server';
import { DEFAULT_COORDINATES } from '@/lib/constants';
import { API_CONFIG, ENDPOINTS } from '@/config/api';
import type { BusStop } from '@/types/bus';

interface CTANBusStop {
  idParada: number;
  nombre: string;
  latitud: number;
  longitud: number;
  municipio: string;
  nucleo: string;
  modos: string[];
  numero?: string;
  distancia: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius') || '500';

    const lat = parseFloat(latitude || DEFAULT_COORDINATES[0].toString());
    const long = parseFloat(longitude || DEFAULT_COORDINATES[1].toString());
    const maxdist = parseInt(radius);

    const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.BUS_STOPS(lat, long, maxdist)}`;
    console.log('🚌 Fetching bus stops from URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ CTAN API error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        error: errorText
      });
      throw new Error(`Failed to fetch bus stops: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🚌 Raw bus stops data:', data);
    
    if (!Array.isArray(data?.paradas)) {
      console.error('❌ Invalid data format:', data);
      throw new Error('Invalid response format from CTAN API');
    }

    const stops: BusStop[] = data.paradas.map((stop: CTANBusStop) => ({
      id: stop.idParada,
      name: stop.nombre,
      latitude: stop.latitud,
      longitude: stop.longitud,
      municipality: stop.municipio,
      nucleus: stop.nucleo,
      transportModes: Array.isArray(stop.modos) ? stop.modos.join(', ') : stop.modos,
      number: stop.numero || '',
      distance: stop.distancia,
      lines: [],
    }));

    // Sort by distance
    const sortedStops = stops.sort((a, b) => a.distance - b.distance);
    console.log(`🚌 Found ${sortedStops.length} bus stops`);

    return NextResponse.json(sortedStops);
  } catch (error) {
    console.error('Error fetching bus stops:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch bus stops' },
      { status: 500 }
    );
  }
}
