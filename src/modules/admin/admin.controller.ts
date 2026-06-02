import { FastifyRequest, FastifyReply } from 'fastify';
import { getAdminStats } from './admin.service';

export async function getAdminStatsHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(await getAdminStats());
}
