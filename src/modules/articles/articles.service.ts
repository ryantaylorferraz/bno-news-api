import { z } from 'zod';
import { ArticleStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const CreateArticleSchema = z.object({
  title:              z.string().min(1, 'Título obrigatório'),
  slug:               z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  chapeu:             z.string().optional().nullable(),
  lead:               z.string().optional().nullable(),
  body:               z.string().min(1, 'Corpo obrigatório'),
  coverImageUrl:      z.string().url().optional().nullable(),
  coverImageCaption:  z.string().optional().nullable(),
  status:             z.nativeEnum(ArticleStatus).default('DRAFT'),
  breaking:           z.boolean().default(false),
  publishedAt:        z.coerce.date().optional().nullable(),
  authorId:           z.string().uuid('authorId deve ser um UUID válido'),
  categoryId:         z.string().uuid('categoryId deve ser um UUID válido'),
});

export const UpdateArticleSchema = CreateArticleSchema.partial();

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>;

// ── Projection reutilizada em listagens ───────────────────────────────────────

const listSelect = {
  id:               true,
  title:            true,
  slug:             true,
  chapeu:           true,
  lead:             true,
  coverImageUrl:    true,
  status:           true,
  breaking:         true,
  views:            true,
  publishedAt:      true,
  createdAt:        true,
  updatedAt:        true,
  author:   { select: { id: true, name: true, slug: true, avatarUrl: true } },
  category: { select: { id: true, name: true, slug: true } },
} as const;

// ── Operações ─────────────────────────────────────────────────────────────────

export async function listArticles(params: {
  status?:       ArticleStatus;
  categoryId?:   string;
  categorySlug?: string;
  breaking?:     boolean;
  q?:            string;
  sort?:         'publishedAt' | 'views' | 'createdAt';
  page?:         number;
  limit?:        number;
}) {
  const { status, categoryId, categorySlug, breaking, q, sort = 'createdAt', page = 1, limit = 20 } = params;

  // Busca por título com unaccent: resolve IDs via raw SQL e injeta no where
  let searchIds: string[] | undefined;
  if (q && q !== '') {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM articles
      WHERE unaccent(title) ILIKE unaccent(${`%${q}%`})
    `;
    searchIds = rows.map((r) => r.id);
  }

  const where: Record<string, unknown> = {
    ...(status       !== undefined && { status }),
    ...(categoryId   !== undefined && { categoryId }),
    ...(breaking     !== undefined && { breaking }),
    ...(categorySlug !== undefined && { category: { slug: categorySlug } }),
    ...(searchIds    !== undefined && { id: { in: searchIds } }),
  };

  const orderBy =
    sort === 'publishedAt' ? { publishedAt: 'desc' as const } :
    sort === 'views'       ? { views: 'desc' as const }       :
                             { createdAt: 'desc' as const };

  const [data, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: listSelect,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return { data, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author:   { select: { id: true, name: true, slug: true, bio: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      images:   { orderBy: { order: 'asc' } },
    },
  });

  if (!article) throw new AppError(404, 'Notícia não encontrada');
  return article;
}

export async function getArticleById(id: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author:   { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      images:   { orderBy: { order: 'asc' } },
    },
  });

  if (!article) throw new AppError(404, 'Notícia não encontrada');
  return article;
}

export async function createArticle(data: CreateArticleInput) {
  const existing = await prisma.article.findUnique({ where: { slug: data.slug } });
  if (existing) throw new AppError(409, 'Já existe uma notícia com este slug');

  // Auto-set publishedAt on first publish
  const publishedAt =
    data.status === 'PUBLISHED' && !data.publishedAt ? new Date() : (data.publishedAt ?? null);

  return prisma.article.create({
    data: { ...data, publishedAt },
    include: {
      author:   { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const existing = await getArticleById(id);

  if (data.slug) {
    const conflict = await prisma.article.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (conflict) throw new AppError(409, 'Já existe uma notícia com este slug');
  }

  // Auto-set publishedAt when publishing for the first time
  const updateData: UpdateArticleInput & { publishedAt?: Date | null } = { ...data };
  if (data.status === 'PUBLISHED' && !existing.publishedAt && !data.publishedAt) {
    updateData.publishedAt = new Date();
  }

  return prisma.article.update({
    where: { id },
    data: updateData,
    include: {
      author:   { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function deleteArticle(id: string) {
  await getArticleById(id);
  await prisma.article.delete({ where: { id } });
}
