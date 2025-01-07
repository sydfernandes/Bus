import { API_CONFIG, ENDPOINTS } from '@/config/api';
import { NextResponse, NextRequest } from 'next/server';
import type { BusLine } from '@/types/bus';
import { getCachedData, setCachedData } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const lineId = request.nextUrl.searchParams.get('lineId');

    if (!lineId) {
      return NextResponse.json(
        { error: 'Line ID is required' },
        { status: 400 }
      );
    }

    // Try to get data from cache
    const cacheKey = `bus_lines_${lineId}`;
    const cachedData = getCachedData<BusLine[]>(cacheKey);
    if (cachedData) {
      console.log('🎯 Returning cached lines for line:', lineId);
      return NextResponse.json(cachedData);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.BUS_STOP_LINES(lineId)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bus lines: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from CTAN API');
    }

    const lines: BusLine[] = data.map((line: any) => ({
      idLinea: line.idLinea,
      codigo: line.codigo,
      nombre: line.nombre,
      descripcion: line.descripcion,
      prioridad: line.prioridad,
    }));

    // Cache the data
    setCachedData(cacheKey, lines);
    console.log('💾 Cached lines for line:', lineId);

    return NextResponse.json(lines);
  } catch (error) {
    console.error('Error fetching bus lines:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch bus lines' },
      { status: 500 }
    );
  }
}
