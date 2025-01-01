import { API_CONFIG } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';
import { BusStop } from '@/types/bus';
import { getCachedData, setCachedData } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lineId = searchParams.get('lineId');

    if (!lineId) {
      return NextResponse.json(
        { error: 'Line ID is required' },
        { status: 400 }
      );
    }

    // Try to get data from cache
    const cacheKey = `bus_line_stops_${lineId}`;
    const cachedData = getCachedData<BusStop[]>(cacheKey);
    if (cachedData) {
      console.log('🎯 Returning cached line stops for line:', lineId);
      return NextResponse.json(cachedData);
    }

    const url = `${API_CONFIG.CTAN.BaseUrl}/Consorcios/${API_CONFIG.CTAN.Consortium}/lineas/${lineId}/paradas?lang=${API_CONFIG.CTAN.Lang}`;
    console.log('🚌 Fetching line stops URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error from CTAN API: ${response.status}`);
    }

    const data = await response.json();
    console.log('🚌 Line stops data:', data);

    // Map the stops data
    const stops = data.paradas?.map((stop: any) => ({
      id: stop.idParada,
      name: stop.nombre,
      latitude: stop.latitud,
      longitude: stop.longitud,
      nucleusId: stop.idNucleo,
      zoneId: stop.idZona,
      transportModes: stop.modos,
      municipalityId: stop.idMunicipio,
      municipality: stop.municipio,
      nucleus: stop.nucleo,
      order: stop.orden // Add order field for proper stop sequence
    })) || [];

    // Sort stops by order
    const sortedStops = stops.sort((a, b) => a.order - b.order);

    // Cache the data
    setCachedData(cacheKey, sortedStops);
    console.log('💾 Cached line stops for line:', lineId);

    return NextResponse.json(sortedStops);
  } catch (error) {
    console.error('Error fetching line stops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch line stops' },
      { status: 500 }
    );
  }
}
