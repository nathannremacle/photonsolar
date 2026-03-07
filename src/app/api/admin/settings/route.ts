import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, hashAdminPassword } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

const DEFAULT_SITE_NAME = 'Photon Solar';
const DEFAULT_SITE_URL = process.env.SITE_URL || 'https://www.photonsolar.be';

export async function GET(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const row = await prisma.adminSettings.findUnique({ where: { id: 'admin' } }).catch(() => null);
    return NextResponse.json({
      settings: {
        adminPassword: process.env.ADMIN_PASSWORD_HASH
          ? '(défini via env)'
          : process.env.ADMIN_PASSWORD
            ? '(défini via env)'
            : row?.adminPasswordHash
              ? '(défini en base)'
              : '(défaut: Opusweb)',
        siteName: row?.siteName ?? DEFAULT_SITE_NAME,
        siteUrl: row?.siteUrl ?? DEFAULT_SITE_URL,
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
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const { adminPassword, siteName, siteUrl } = await request.json();

    const data: { adminPasswordHash?: string; siteName?: string; siteUrl?: string } = {};
    if (typeof adminPassword === 'string' && adminPassword.trim().length >= 6) {
      data.adminPasswordHash = hashAdminPassword(adminPassword.trim());
    }
    if (typeof siteName === 'string' && siteName.trim()) {
      data.siteName = siteName.trim();
    }
    if (typeof siteUrl === 'string' && siteUrl.trim()) {
      data.siteUrl = siteUrl.trim();
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: true, message: 'Aucune modification.' });
    }

    await prisma.adminSettings.upsert({
      where: { id: 'admin' },
      create: {
        id: 'admin',
        adminPasswordHash: data.adminPasswordHash ?? null,
        siteName: data.siteName ?? null,
        siteUrl: data.siteUrl ?? null,
      },
      update: data,
    });

    return NextResponse.json({
      success: true,
      message: 'Paramètres sauvegardés en base de données.',
    });
  } catch (error) {
    console.error('Error saving admin settings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des paramètres' },
      { status: 500 }
    );
  }
}
