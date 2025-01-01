import { NextResponse } from 'next/server';
import { API_CONFIG, ENDPOINTS } from '@/config/api';
import { BusStop, CTANBusStop } from '@/types/bus';
import { getCachedData, setCachedData } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const long = searchParams.get('long');

    if (!lat || !long) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Create a cache key based on coordinates (rounded to 4 decimal places for better cache hits)
    const cacheKey = `bus_stops_${Number(lat).toFixed(4)}_${Number(long).toFixed(4)}`;
    
    // Try to get data from cache
    const cachedData = getCachedData<BusStop[]>(cacheKey);
    if (cachedData) {
      console.log('🎯 Returning cached bus stops data');
      return NextResponse.json(cachedData);
    }

    const url = ENDPOINTS.BUS_STOPS(Number(lat), Number(long));
    console.log('🚌 Fetching bus stops from CTAN:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error from CTAN API: ${response.status}`);
    }

    const data = await response.json();
    console.log('🚌 Bus stops data from CTAN:', data);

    // Map the stops data from CTAN format
    const mappedStops = data.paradas?.map((stop: CTANBusStop) => ({
      id: stop.idParada,
      name: stop.nombre,
      latitude: stop.latitud,
      longitude: stop.longitud,
      nucleusId: stop.idNucleo,
      zoneId: stop.idZona,
      transportModes: stop.modos,
      municipalityId: stop.idMunicipio,
      municipality: stop.municipio,
      nucleus: stop.nucleo
    })) || [];

    // Cache the mapped data
    setCachedData(cacheKey, mappedStops);
    console.log('💾 Cached bus stops data for key:', cacheKey);

    return NextResponse.json(mappedStops);
  } catch (error) {
    console.error('Error fetching bus stops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus stops' },
      { status: 500 }
    );
  }
}
