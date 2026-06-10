import { FastifyRequest, FastifyReply } from 'fastify';
import { TipStatus } from '@prisma/client';
import {
  createTip,
  listTips,
  getTipById,
  updateTipStatus,
  CreateTipSchema,
  UpdateTipStatusSchema,
} from './tips.service';

type IdParams  = { id: string };
type ListQuery = { status?: string; page?: string; limit?: string };

export async function createTipHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const input = CreateTipSchema.parse(request.body);
  const tip = await createTip(input);
  return reply.status(201).send(tip);
}

export async function listTipsHandler(
  request: FastifyRequest<{ Querystring: ListQuery }>,
  reply: FastifyReply,
) {
  const { status, page, limit } = request.query;
  const result = await listTips({
    status: status as TipStatus | undefined,
    page:   page  ? Number(page)  : undefined,
    limit:  limit ? Number(limit) : undefined,
  });
  return reply.send(result);
}

export async function getTipByIdHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const tip = await getTipById(request.params.id);
  return reply.send(tip);
}

export async function updateTipStatusHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const input = UpdateTipStatusSchema.parse(request.body);
  const tip = await updateTipStatus(request.params.id, input);
  return reply.send(tip);
}
