import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import { getAdminStatsHandler } from './admin.controller';

export async function adminRoutes(app: FastifyInstance) {
  app.get('/stats', { preHandler: [authenticate] }, getAdminStatsHandler);
}
