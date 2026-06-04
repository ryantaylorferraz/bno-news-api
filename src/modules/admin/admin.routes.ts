import { FastifyInstance } from 'fastify';
import { authenticate, authorizeAdmin } from '../../middleware/auth';
import { getAdminStatsHandler } from './admin.controller';

export async function adminRoutes(app: FastifyInstance) {
  app.get('/stats', { preHandler: [authenticate, authorizeAdmin] }, getAdminStatsHandler);
}
