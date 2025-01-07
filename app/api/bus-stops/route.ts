import { NextResponse } from 'next/server';
import { busStops } from '@/lib/staticData';

export async function GET() {
  try {
    return NextResponse.json(busStops);
  } catch (error) {
    console.error('Error fetching bus stops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus stops' },
      { status: 500 }
    );
  }
}
