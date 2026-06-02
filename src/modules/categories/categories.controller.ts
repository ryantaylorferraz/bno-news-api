import { FastifyRequest, FastifyReply } from 'fastify';
import {
  listCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  CreateCategorySchema,
  UpdateCategorySchema,
} from './categories.service';

type SlugParams = { slug: string };
type IdParams   = { id: string };

export async function listCategoriesHandler(_request: FastifyRequest, reply: FastifyReply) {
  const categories = await listCategories();
  return reply.send(categories);
}

export async function getCategoryBySlugHandler(
  request: FastifyRequest<{ Params: SlugParams }>,
  reply: FastifyReply,
) {
  const category = await getCategoryBySlug(request.params.slug);
  return reply.send(category);
}

export async function getCategoryByIdHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const category = await getCategoryById(request.params.id);
  return reply.send(category);
}

export async function createCategoryHandler(request: FastifyRequest, reply: FastifyReply) {
  const input = CreateCategorySchema.parse(request.body);
  const category = await createCategory(input);
  return reply.status(201).send(category);
}

export async function updateCategoryHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const input = UpdateCategorySchema.parse(request.body);
  const category = await updateCategory(request.params.id, input);
  return reply.send(category);
}

export async function deleteCategoryHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  await deleteCategory(request.params.id);
  return reply.status(204).send();
}
