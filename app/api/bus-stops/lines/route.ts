import { NextResponse } from 'next/server';
import { API_CONFIG, ENDPOINTS } from '@/config/api';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stopId = searchParams.get('stopId');

    if (!stopId) {
      return NextResponse.json({ error: 'Stop ID is required' }, { status: 400 });
    }

    const url = ENDPOINTS.BUS_STOP_LINES(stopId);
    console.log('🚌 Fetching bus stop lines URL:', url);

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
    console.log('🚌 Raw bus stop lines data:', data);

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

    return NextResponse.json(lines);
  } catch (error) {
    console.error('❌ Error in GET /api/bus-stops/lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus stop lines' },
      { status: 500 }
    );
  }
}
