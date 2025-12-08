import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SETTINGS_FILE = join(process.cwd(), 'data/admin-settings.json');

export async function GET() {
  try {
    // In production, use environment variables instead
    return NextResponse.json({
      settings: {
        adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
        siteName: 'Photon Solar',
        siteUrl: process.env.SITE_URL || 'https://www.photonsolar.be',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { adminPassword, siteName, siteUrl } = await request.json();

    // In production, update environment variables or use a proper settings system
    const settings: any = {};
    
    if (adminPassword) {
      settings.adminPassword = adminPassword;
      // Note: In production, hash the password!
    }
    
    if (siteName) {
      settings.siteName = siteName;
    }
    
    if (siteUrl) {
      settings.siteUrl = siteUrl;
    }

    // Save to file (for development)
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true,
      message: 'Paramètres sauvegardés. Note: En production, utilisez des variables d\'environnement.'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des paramètres' },
      { status: 500 }
    );
  }
}

