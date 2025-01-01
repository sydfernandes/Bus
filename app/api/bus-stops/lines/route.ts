import { NextResponse } from 'next/server';
import { API_CONFIG, ENDPOINTS } from '@/config/api';
import { getCachedData, setCachedData } from '@/lib/cache';

interface BusLine {
  id: string;
  name: string;
  shortName: string;
  code: string;
  description: string;
  originStop: string;
  destinationStop: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stopId = searchParams.get('stopId');

    if (!stopId) {
      console.error('❌ Missing stop ID');
      return NextResponse.json(
        { error: 'Se requiere el ID de la parada' },
        { status: 400 }
      );
    }

    // Try to get data from cache
    const cacheKey = `bus_lines_${stopId}`;
    const cachedData = getCachedData<BusLine[]>(cacheKey);
    if (cachedData) {
      console.log('🎯 Returning cached bus lines data for stop:', stopId);
      return NextResponse.json(cachedData);
    }

    const url = ENDPOINTS.BUS_STOP_LINES(stopId);
    console.log('🚌 Fetching bus lines URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': API_CONFIG.CTAN.Lang
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ CTAN API error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        error: errorText
      });
      throw new Error(`CTAN API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🚌 Raw bus lines data:', data);

    if (!data.lineas || !Array.isArray(data.lineas)) {
      console.error('❌ Unexpected data format:', data);
      throw new Error('Unexpected data format from CTAN API');
    }

    // Map the lines data
    const lines = data.lineas.map((line: any) => ({
      id: line.idLinea,
      name: line.nombreLinea || line.nombre,
      shortName: line.nombreCorto || line.codigo,
      code: line.codigo,
      description: line.descripcion,
      originStop: line.cabeceraIda,
      destinationStop: line.cabeceraVuelta
    }));

    // Cache the mapped data
    setCachedData(cacheKey, lines);
    console.log('💾 Cached bus lines data for stop:', stopId);

    return NextResponse.json(lines);
  } catch (error) {
    console.error('❌ Error in GET /api/bus-stops/lines:', error);
    return NextResponse.json(
      { error: 'No se pudieron obtener las líneas' },
      { status: 500 }
    );
  }
}
