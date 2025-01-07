import { NextResponse } from 'next/server';
import { API_CONFIG, ENDPOINTS } from '@/config/api';

export async function GET() {
  try {
    const url = ENDPOINTS.BUS_STOPS;
    console.log('🚌 Fetching bus stops URL:', url);

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
    console.log('🚌 Raw bus stops data:', data);

    if (!data.paradas || !Array.isArray(data.paradas)) {
      console.error('❌ Unexpected data format:', data);
      throw new Error('Unexpected data format from CTAN API');
    }

    // Map the stops data
    const stops = data.paradas.map((stop: any) => ({
      id: stop.idParada,
      name: stop.nombre,
      latitude: stop.latitud,
      longitude: stop.longitud,
      municipality: stop.municipio,
      lines: stop.lineas || []
    }));

    return NextResponse.json(stops);
  } catch (error) {
    console.error('❌ Error in GET /api/bus-stops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus stops' },
      { status: 500 }
    );
  }
}
