import { NextRequest, NextResponse } from 'next/server';
import { loadFormationsContent, saveFormationsContent, type Formation } from '@/lib/formation-storage';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const formations = await loadFormationsContent();
    return NextResponse.json({ formations });
  } catch (error) {
    console.error('Error loading formations:', error);
    return NextResponse.json(
      { error: 'Failed to load formations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const body = await request.json();
    const { formations } = body;

    if (!Array.isArray(formations)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    await saveFormationsContent(formations as Formation[]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving formations:', error);
    return NextResponse.json(
      { error: 'Failed to save formations' },
      { status: 500 }
    );
  }
}
