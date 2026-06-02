import { FastifyRequest, FastifyReply } from 'fastify';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  CreateUserSchema,
  UpdateUserSchema,
} from './users.service';

type IdParams = { id: string };

export async function listUsersHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(await listUsers());
}

export async function getUserByIdHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  return reply.send(await getUserById(request.params.id));
}

export async function createUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const input = CreateUserSchema.parse(request.body);
  return reply.status(201).send(await createUser(input));
}

export async function updateUserHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const input = UpdateUserSchema.parse(request.body);
  return reply.send(await updateUser(request.params.id, input));
}
