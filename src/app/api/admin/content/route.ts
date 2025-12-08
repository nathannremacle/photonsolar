import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const CONTENT_FILE = join(process.cwd(), 'data/site-content.json');

function loadContent() {
  if (existsSync(CONTENT_FILE)) {
    try {
      const content = readFileSync(CONTENT_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading content file:', error);
      return null;
    }
  }
  return null;
}

function saveContent(content: any) {
  try {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const content = loadContent();
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contenu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Contenu requis' },
        { status: 400 }
      );
    }

    saveContent(content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du contenu' },
      { status: 500 }
    );
  }
}

