import { NextResponse, NextRequest } from 'next/server';
import { API_CONFIG, ENDPOINTS } from '@/config/api';
import { getCachedData, setCachedData } from '@/lib/cache';
import type { BusStop } from '@/types/bus';

interface CTANBusLineStop {
  idParada: number;
  orden: number;
  idLinea: number;
  codigoLinea: string;
  nombreLinea: string;
  descripcionLinea: string;
  prioridad: number;
  idNucleo: number;
  idZona: number;
  nombre: string;
  latitud: number;
  longitud: number;
  modos: string;
  idMunicipio: number;
  municipio: string;
  nucleo: string;
}

export async function GET(request: NextRequest) {
  try {
    const lineId = request.nextUrl.searchParams.get('lineId');

    if (!lineId) {
      return NextResponse.json({ error: 'Line ID is required' }, { status: 400 });
    }

    const cacheKey = `line-stops-${lineId}`;
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.BUS_LINE_DETAILS(lineId)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch line stops: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data?.paradas)) {
      throw new Error('Invalid response format from CTAN API');
    }

    interface CTANBusLineStop {
      idParada: number;
      nombre: string;
      latitud: number;
      longitud: number;
      municipio: string;
      nucleo: string;
      modos: string;
      orden: number;
    }

    const stops: (BusStop & { order: number })[] = data.paradas.map((stop: CTANBusLineStop) => ({
      id: stop.idParada,
      name: stop.nombre,
      latitude: stop.latitud,
      longitude: stop.longitud,
      municipality: stop.municipio,
      nucleus: stop.nucleo,
      transportModes: stop.modos,
      number: '',
      distance: 0,
      lines: [],
      order: stop.orden
    }));

    // Sort stops by order
    const sortedStops = stops.sort((a, b) => a.order - b.order);

    // Cache the sorted stops
    setCachedData(cacheKey, sortedStops);

    return NextResponse.json(sortedStops);
  } catch (error) {
    console.error('Error fetching line stops:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch line stops' },
      { status: 500 }
    );
  }
}
