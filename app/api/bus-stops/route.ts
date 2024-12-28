import { NextResponse } from 'next/server';
import { API_CONFIG, ENDPOINTS } from '@/config/api';
import { BusStop, CTANBusStop } from '@/types/bus';

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

    return NextResponse.json(mappedStops);
  } catch (error) {
    console.error('Error fetching bus stops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus stops' },
      { status: 500 }
    );
  }
}
