import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import {
  listAuthorsHandler,
  getAuthorBySlugHandler,
  getAuthorByIdHandler,
  createAuthorHandler,
  updateAuthorHandler,
} from './authors.controller';

type Id   = { Params: { id: string } };
type Slug = { Params: { slug: string } };

export async function authorRoutes(app: FastifyInstance) {
  // ── Public ────────────────────────────────────────────────────────────────
  app.get('/',                 listAuthorsHandler);
  app.get<Slug>('/slug/:slug', getAuthorBySlugHandler);
  app.get<Id>  ('/:id',        getAuthorByIdHandler);

  // ── Protected ─────────────────────────────────────────────────────────────
  app.post(      '/',    { preHandler: [authenticate] }, createAuthorHandler);
  app.patch<Id>( '/:id', { preHandler: [authenticate] }, updateAuthorHandler);
}
