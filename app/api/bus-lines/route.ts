import { NextResponse } from 'next/server';
import { busLines } from '@/lib/staticData';

export async function GET() {
  try {
    return NextResponse.json(busLines);
  } catch (error) {
    console.error('Error fetching bus lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus lines' },
      { status: 500 }
    );
  }
}
