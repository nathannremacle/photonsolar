import { prisma } from './prisma';
import type { Formation as PrismaFormation } from '@prisma/client';

// ==============================================
// Types
// ==============================================

export interface Formation {
  id: number;
  order: number;
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  link: string;
  content: string;
  image?: string;
  published?: boolean;
}

// ==============================================
// Helpers
// ==============================================

export function generateFormationSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function prismaToFormation(f: PrismaFormation): Formation {
  return {
    id: f.id,
    order: f.order,
    title: f.title,
    date: f.date.toISOString().split('T')[0],
    excerpt: f.excerpt,
    slug: f.slug,
    link: `/formations/${f.slug}`,
    content: f.content,
    image: f.image || undefined,
    published: f.published,
  };
}

function formationToPrismaData(f: Omit<Formation, 'id' | 'link'> & { id?: number; order?: number }) {
  return {
    order: f.order ?? 0,
    title: f.title,
    slug: f.slug || generateFormationSlug(f.title),
    date: new Date(f.date),
    excerpt: f.excerpt,
    content: f.content || f.excerpt,
    image: f.image || null,
    published: f.published ?? true,
  };
}

// ==============================================
// CRUD
// ==============================================

export async function loadFormationsContent(): Promise<Formation[]> {
  try {
    const list = await prisma.formation.findMany({
      orderBy: [{ order: 'asc' }, { date: 'desc' }],
    });
    return list.map(prismaToFormation);
  } catch (error) {
    console.error('Error loading formations:', error);
    return [];
  }
}

export async function loadPublishedFormations(): Promise<Formation[]> {
  try {
    const list = await prisma.formation.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { date: 'desc' }],
    });
    return list.map(prismaToFormation);
  } catch (error) {
    console.error('Error loading published formations:', error);
    return [];
  }
}

export async function getFormationBySlug(slug: string): Promise<Formation | null> {
  try {
    const f = await prisma.formation.findUnique({
      where: { slug },
    });
    return f ? prismaToFormation(f) : null;
  } catch (error) {
    console.error('Error getting formation by slug:', error);
    return null;
  }
}

export async function getFormationById(id: number): Promise<Formation | null> {
  try {
    const f = await prisma.formation.findUnique({
      where: { id },
    });
    return f ? prismaToFormation(f) : null;
  } catch (error) {
    console.error('Error getting formation by ID:', error);
    return null;
  }
}

export async function createFormation(formation: Omit<Formation, 'id' | 'link'>): Promise<Formation> {
  try {
    const created = await prisma.formation.create({
      data: formationToPrismaData(formation),
    });
    return prismaToFormation(created);
  } catch (error) {
    console.error('Error creating formation:', error);
    throw error;
  }
}

export async function updateFormation(id: number, formation: Partial<Formation>): Promise<Formation> {
  try {
    const updateData: Record<string, unknown> = {};
    if (formation.order !== undefined) updateData.order = formation.order;
    if (formation.title !== undefined) updateData.title = formation.title;
    if (formation.slug !== undefined) updateData.slug = formation.slug;
    if (formation.date !== undefined) updateData.date = new Date(formation.date);
    if (formation.excerpt !== undefined) updateData.excerpt = formation.excerpt;
    if (formation.content !== undefined) updateData.content = formation.content;
    if (formation.image !== undefined) updateData.image = formation.image || null;
    if (formation.published !== undefined) updateData.published = formation.published;

    const updated = await prisma.formation.update({
      where: { id },
      data: updateData,
    });
    return prismaToFormation(updated);
  } catch (error) {
    console.error('Error updating formation:', error);
    throw error;
  }
}

export async function deleteFormation(id: number): Promise<void> {
  try {
    await prisma.formation.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting formation:', error);
    throw error;
  }
}

/**
 * Save all formations (bulk replace) for admin panel
 */
export async function saveFormationsContent(formations: Formation[]): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.formation.findMany({ select: { id: true } });
      const existingIds = new Set(existing.map((f) => f.id));
      const newIds = new Set(formations.map((f) => f.id).filter(Boolean));
      const toDelete = [...existingIds].filter((id) => !newIds.has(id));

      if (toDelete.length > 0) {
        await tx.formation.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      for (const f of formations) {
        const data = formationToPrismaData(f);
        if (f.id && existingIds.has(f.id)) {
          await tx.formation.update({
            where: { id: f.id },
            data,
          });
        } else {
          await tx.formation.create({
            data,
          });
        }
      }
    });
  } catch (error) {
    console.error('Error saving formations:', error);
    throw error;
  }
}
