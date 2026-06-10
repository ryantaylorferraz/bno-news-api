import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import {
  createTipHandler,
  listTipsHandler,
  getTipByIdHandler,
  updateTipStatusHandler,
} from './tips.controller';

type Id      = { Params: { id: string } };
type ListQ   = { Querystring: { status?: string; page?: string; limit?: string } };

export async function tipRoutes(app: FastifyInstance) {
  // ── Public ────────────────────────────────────────────────────────────────
  app.post('/', createTipHandler);

  // ── Protected ─────────────────────────────────────────────────────────────
  app.get<ListQ>('/',    { preHandler: [authenticate] }, listTipsHandler);
  app.get<Id>(   '/:id', { preHandler: [authenticate] }, getTipByIdHandler);
  app.patch<Id>( '/:id', { preHandler: [authenticate] }, updateTipStatusHandler);
}
