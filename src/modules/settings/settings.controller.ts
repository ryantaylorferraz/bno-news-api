import { FastifyRequest, FastifyReply } from 'fastify';
import { getSettings, upsertSettings, UpsertSettingsSchema } from './settings.service';

export async function getSettingsHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(await getSettings());
}

export async function upsertSettingsHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = UpsertSettingsSchema.parse(request.body);
  return reply.send(await upsertSettings(data));
}
