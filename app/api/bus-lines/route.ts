import { NextResponse } from 'next/server';
import { API_CONFIG, ENDPOINTS } from '@/config/api';

export async function GET() {
  try {
    const url = ENDPOINTS.BUS_LINES;
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

    return NextResponse.json(lines);
  } catch (error) {
    console.error('❌ Error in GET /api/bus-lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus lines' },
      { status: 500 }
    );
  }
}
