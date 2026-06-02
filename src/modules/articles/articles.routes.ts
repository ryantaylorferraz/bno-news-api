import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import {
  listArticlesHandler,
  getArticleBySlugHandler,
  getArticleByIdHandler,
  createArticleHandler,
  updateArticleHandler,
  deleteArticleHandler,
} from './articles.controller';

type Id   = { Params: { id: string } };
type Slug = { Params: { slug: string } };

export async function articleRoutes(app: FastifyInstance) {
  // ── Public ────────────────────────────────────────────────────────────────
  app.get('/',                listArticlesHandler);
  app.get<Slug>('/slug/:slug', getArticleBySlugHandler);
  app.get<Id>  ('/:id',        getArticleByIdHandler);

  // ── Protected ─────────────────────────────────────────────────────────────
  app.post(        '/',    { preHandler: [authenticate] }, createArticleHandler);
  app.patch<Id>(   '/:id', { preHandler: [authenticate] }, updateArticleHandler);
  app.delete<Id>(  '/:id', { preHandler: [authenticate] }, deleteArticleHandler);
}
