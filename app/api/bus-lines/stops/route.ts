import { NextResponse } from 'next/server';
import { API_CONFIG, ENDPOINTS } from '@/config/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get('lineId');

    if (!lineId) {
      return NextResponse.json({ error: 'Line ID is required' }, { status: 400 });
    }

    const url = ENDPOINTS.BUS_LINE_STOPS(lineId);
    console.log('🚌 Fetching bus line stops URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': API_CONFIG.CTAN.Lang
      },
      next: {
        revalidate: 3600 // Revalidate every hour
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
      return NextResponse.json(
        { error: `CTAN API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🚌 Raw bus line stops data:', data);

    if (!data.paradas || !Array.isArray(data.paradas)) {
      console.error('❌ Unexpected data format:', data);
      return NextResponse.json(
        { error: 'Unexpected data format from CTAN API' },
        { status: 500 }
      );
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
    console.error('❌ Error fetching bus line stops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus line stops' },
      { status: 500 }
    );
  }
}
