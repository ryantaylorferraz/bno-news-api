import { FastifyRequest, FastifyReply } from 'fastify';
import { ArticleStatus } from '@prisma/client';
import {
  listArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  CreateArticleSchema,
  UpdateArticleSchema,
} from './articles.service';

// ── Query / Params types ──────────────────────────────────────────────────────

type ListQuery = {
  status?:       string;
  categoryId?:   string;
  categorySlug?: string;
  breaking?:     string;
  q?:            string;
  sort?:         string;
  page?:         string;
  limit?:        string;
};

type SlugParams = { slug: string };
type IdParams   = { id: string };

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function listArticlesHandler(
  request: FastifyRequest<{ Querystring: ListQuery }>,
  reply: FastifyReply,
) {
  const { status, categoryId, categorySlug, breaking, q, sort, page, limit } = request.query;

  const result = await listArticles({
    status:       status as ArticleStatus | undefined,
    categoryId,
    categorySlug,
    breaking:     breaking === 'true' ? true : breaking === 'false' ? false : undefined,
    q,
    sort:         sort as 'publishedAt' | 'views' | 'createdAt' | undefined,
    page:         page  ? Number(page)  : undefined,
    limit:        limit ? Number(limit) : undefined,
  });

  return reply.send(result);
}

export async function getArticleBySlugHandler(
  request: FastifyRequest<{ Params: SlugParams }>,
  reply: FastifyReply,
) {
  const article = await getArticleBySlug(request.params.slug);
  return reply.send(article);
}

export async function getArticleByIdHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const article = await getArticleById(request.params.id);
  return reply.send(article);
}

export async function createArticleHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const input = CreateArticleSchema.parse(request.body);
  const article = await createArticle(input);
  return reply.status(201).send(article);
}

export async function updateArticleHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const input = UpdateArticleSchema.parse(request.body);
  const article = await updateArticle(request.params.id, input);
  return reply.send(article);
}

export async function deleteArticleHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  await deleteArticle(request.params.id);
  return reply.status(204).send();
}
