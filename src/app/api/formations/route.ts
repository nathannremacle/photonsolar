import { NextResponse } from 'next/server';
import { loadPublishedFormations } from '@/lib/formation-storage';

export async function GET() {
  try {
    const formations = await loadPublishedFormations();
    return NextResponse.json({ formations });
  } catch (error) {
    console.error('Error loading formations:', error);
    return NextResponse.json(
      { error: 'Failed to load formations' },
      { status: 500 }
    );
  }
}
