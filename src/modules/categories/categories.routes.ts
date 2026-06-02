import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import {
  listCategoriesHandler,
  getCategoryBySlugHandler,
  getCategoryByIdHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from './categories.controller';

type Id   = { Params: { id: string } };
type Slug = { Params: { slug: string } };

export async function categoryRoutes(app: FastifyInstance) {
  // ── Public ────────────────────────────────────────────────────────────────
  app.get('/',                 listCategoriesHandler);
  app.get<Slug>('/slug/:slug', getCategoryBySlugHandler);
  app.get<Id>  ('/:id',        getCategoryByIdHandler);

  // ── Protected ─────────────────────────────────────────────────────────────
  app.post(       '/',    { preHandler: [authenticate] }, createCategoryHandler);
  app.patch<Id>(  '/:id', { preHandler: [authenticate] }, updateCategoryHandler);
  app.delete<Id>( '/:id', { preHandler: [authenticate] }, deleteCategoryHandler);
}
