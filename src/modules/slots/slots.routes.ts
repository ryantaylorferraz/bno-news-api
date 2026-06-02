import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import { listSlotsHandler, assignSlotHandler, clearSlotHandler } from './slots.controller';

type SlotKey = { Params: { slotKey: string } };

export async function slotRoutes(app: FastifyInstance) {
  // ── Public ────────────────────────────────────────────────────────────────
  app.get('/', listSlotsHandler);

  // ── Protected ─────────────────────────────────────────────────────────────
  app.put<SlotKey>(    '/:slotKey',         { preHandler: [authenticate] }, assignSlotHandler);
  app.delete<SlotKey>( '/:slotKey/article', { preHandler: [authenticate] }, clearSlotHandler);
}
