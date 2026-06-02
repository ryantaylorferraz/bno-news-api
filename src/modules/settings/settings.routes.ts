import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import { getSettingsHandler, upsertSettingsHandler } from './settings.controller';

export async function settingRoutes(app: FastifyInstance) {
  app.get('/',  { preHandler: [authenticate] }, getSettingsHandler);
  app.put('/',  { preHandler: [authenticate] }, upsertSettingsHandler);
}
