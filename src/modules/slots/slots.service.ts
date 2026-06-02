import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

// ── Constantes ────────────────────────────────────────────────────────────────

export const SLOT_KEYS = ['hero', 'highlight_1', 'highlight_2', 'highlight_3'] as const;
export type SlotKey = (typeof SLOT_KEYS)[number];

// ── Schema ────────────────────────────────────────────────────────────────────

export const AssignSlotSchema = z.object({
  articleId: z.string().uuid('articleId deve ser um UUID válido'),
});

// ── Projection do artigo no slot ──────────────────────────────────────────────

const articleSelect = {
  id:           true,
  title:        true,
  slug:         true,
  coverImageUrl: true,
  category: { select: { id: true, name: true, slug: true } },
} as const;

// ── Operações ─────────────────────────────────────────────────────────────────

export async function listSlots() {
  const rows = await prisma.featuredSlot.findMany({
    where:   { slotKey: { in: [...SLOT_KEYS] } },
    include: { article: { select: articleSelect } },
  });

  // Garante que todos os 4 slots apareçam mesmo que não existam no DB
  return SLOT_KEYS.map((key) => {
    const row = rows.find((r) => r.slotKey === key);
    return row ?? { slotKey: key, article: null };
  });
}

export async function assignSlot(slotKey: string, articleId: string) {
  if (!SLOT_KEYS.includes(slotKey as SlotKey)) {
    throw new AppError(400, `slotKey inválido. Valores aceitos: ${SLOT_KEYS.join(', ')}`);
  }

  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new AppError(404, 'Notícia não encontrada');

  return prisma.featuredSlot.upsert({
    where:   { slotKey },
    update:  { articleId },
    create:  { slotKey, articleId },
    include: { article: { select: articleSelect } },
  });
}

export async function clearSlot(slotKey: string) {
  if (!SLOT_KEYS.includes(slotKey as SlotKey)) {
    throw new AppError(400, `slotKey inválido. Valores aceitos: ${SLOT_KEYS.join(', ')}`);
  }

  await prisma.featuredSlot.upsert({
    where:  { slotKey },
    update: { articleId: null },
    create: { slotKey, articleId: null },
  });
}
