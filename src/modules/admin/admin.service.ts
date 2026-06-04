import { prisma } from '../../lib/prisma';

export async function getAdminStats() {
  const [totalPublished, totalDrafts, totalArchived, breakingCount, activeCategories] = await Promise.all([
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.article.count({ where: { status: 'DRAFT' } }),
    prisma.article.count({ where: { status: 'ARCHIVED' } }),
    prisma.article.count({ where: { status: 'PUBLISHED', breaking: true } }),
    prisma.category.count({ where: { active: true } }),
  ]);

  return { totalPublished, totalDrafts, totalArchived, breakingCount, activeCategories };
}
