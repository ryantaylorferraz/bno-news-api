import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name:        z.string().min(1, 'Nome obrigatório'),
  slug:        z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  description: z.string().optional().nullable(),
  order:       z.number().int().default(0),
  active:      z.boolean().default(true),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// ── Operações ─────────────────────────────────────────────────────────────────

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { articles: true } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      articles: {
        where:   { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take:    10,
        select: {
          id:           true,
          title:        true,
          slug:         true,
          lead:         true,
          coverImageUrl: true,
          breaking:     true,
          publishedAt:  true,
          author: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!category) throw new AppError(404, 'Editoria não encontrada');
  return category;
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError(404, 'Editoria não encontrada');
  return category;
}

export async function createCategory(data: CreateCategoryInput) {
  const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (existing) throw new AppError(409, 'Já existe uma editoria com este slug');
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  await getCategoryById(id);

  if (data.slug) {
    const conflict = await prisma.category.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (conflict) throw new AppError(409, 'Já existe uma editoria com este slug');
  }

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  await getCategoryById(id);

  const count = await prisma.article.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new AppError(409, `Não é possível remover: editoria possui ${count} notícia(s)`);
  }

  await prisma.category.delete({ where: { id } });
}
