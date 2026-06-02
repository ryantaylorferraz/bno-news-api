import { FastifyRequest, FastifyReply } from 'fastify';
import {
  listAuthors,
  getAuthorBySlug,
  getAuthorById,
  createAuthor,
  updateAuthor,
  CreateAuthorSchema,
  UpdateAuthorSchema,
} from './authors.service';

type SlugParams = { slug: string };
type IdParams   = { id: string };

export async function listAuthorsHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(await listAuthors());
}

export async function getAuthorBySlugHandler(
  request: FastifyRequest<{ Params: SlugParams }>,
  reply: FastifyReply,
) {
  return reply.send(await getAuthorBySlug(request.params.slug));
}

export async function getAuthorByIdHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  return reply.send(await getAuthorById(request.params.id));
}

export async function createAuthorHandler(request: FastifyRequest, reply: FastifyReply) {
  const input = CreateAuthorSchema.parse(request.body);
  return reply.status(201).send(await createAuthor(input));
}

export async function updateAuthorHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const input = UpdateAuthorSchema.parse(request.body);
  return reply.send(await updateAuthor(request.params.id, input));
}
