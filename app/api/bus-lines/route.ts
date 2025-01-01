import { API_CONFIG } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';
import { BusLine } from '@/types/bus';
import { getCachedData, setCachedData } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stopId = searchParams.get('stopId');

    if (!stopId) {
      return NextResponse.json(
        { error: 'Stop ID is required' },
        { status: 400 }
      );
    }

    // Try to get data from cache
    const cacheKey = `bus_lines_${stopId}`;
    const cachedData = getCachedData<BusLine[]>(cacheKey);
    if (cachedData) {
      console.log('🎯 Returning cached lines for stop:', stopId);
      return NextResponse.json(cachedData);
    }

    const url = `${API_CONFIG.CTAN.BaseUrl}/Consorcios/${API_CONFIG.CTAN.Consortium}/paradas/lineasPorParadas/${stopId}?lang=${API_CONFIG.CTAN.Lang}`;
    console.log('🚌 Fetching lines URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error from CTAN API: ${response.status}`);
    }

    const data = await response.json();
    console.log('🚌 Lines data:', data);

    // Cache the data
    setCachedData(cacheKey, data);
    console.log('💾 Cached lines for stop:', stopId);

    // Validate and return the data as is since it matches our BusLine interface
    return NextResponse.json(data as BusLine[]);
  } catch (error) {
    console.error('Error fetching bus lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus lines' },
      { status: 500 }
    );
  }
}
