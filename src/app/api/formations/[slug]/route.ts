import { NextRequest, NextResponse } from 'next/server';
import { getFormationBySlug } from '@/lib/formation-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const formation = await getFormationBySlug(slug);

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation not found' },
        { status: 404 }
      );
    }

    if (formation.published === false) {
      return NextResponse.json(
        { error: 'Formation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ formation });
  } catch (error) {
    console.error('Error loading formation:', error);
    return NextResponse.json(
      { error: 'Failed to load formation' },
      { status: 500 }
    );
  }
}
