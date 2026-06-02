import { FastifyRequest, FastifyReply } from 'fastify';
import { listSlots, assignSlot, clearSlot, AssignSlotSchema } from './slots.service';

type SlotKeyParams = { slotKey: string };

export async function listSlotsHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(await listSlots());
}

export async function assignSlotHandler(
  request: FastifyRequest<{ Params: SlotKeyParams }>,
  reply: FastifyReply,
) {
  const { articleId } = AssignSlotSchema.parse(request.body);
  const slot = await assignSlot(request.params.slotKey, articleId);
  return reply.send(slot);
}

export async function clearSlotHandler(
  request: FastifyRequest<{ Params: SlotKeyParams }>,
  reply: FastifyReply,
) {
  await clearSlot(request.params.slotKey);
  return reply.status(204).send();
}
