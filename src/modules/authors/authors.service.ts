import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const CreateAuthorSchema = z.object({
  name:      z.string().min(1, 'Nome obrigatório'),
  slug:      z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  bio:       z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  role:      z.string().optional().nullable(),
  active:    z.boolean().default(true),
});

export const UpdateAuthorSchema = CreateAuthorSchema.partial();

export type CreateAuthorInput = z.infer<typeof CreateAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof UpdateAuthorSchema>;

// ── Operações ─────────────────────────────────────────────────────────────────

export async function listAuthors() {
  return prisma.author.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  });
}

export async function getAuthorBySlug(slug: string) {
  const author = await prisma.author.findUnique({
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
          publishedAt:  true,
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!author) throw new AppError(404, 'Autor não encontrado');
  return author;
}

export async function getAuthorById(id: string) {
  const author = await prisma.author.findUnique({ where: { id } });
  if (!author) throw new AppError(404, 'Autor não encontrado');
  return author;
}

export async function createAuthor(data: CreateAuthorInput) {
  const existing = await prisma.author.findUnique({ where: { slug: data.slug } });
  if (existing) throw new AppError(409, 'Já existe um autor com este slug');
  return prisma.author.create({ data });
}

export async function updateAuthor(id: string, data: UpdateAuthorInput) {
  await getAuthorById(id);

  if (data.slug) {
    const conflict = await prisma.author.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (conflict) throw new AppError(409, 'Já existe um autor com este slug');
  }

  return prisma.author.update({ where: { id }, data });
}

export async function deleteAuthor(id: string) {
  await getAuthorById(id);

  const count = await prisma.article.count({ where: { authorId: id } });
  if (count > 0) {
    throw new AppError(409, `Não é possível remover: autor possui ${count} notícia(s)`);
  }

  await prisma.author.delete({ where: { id } });
}
