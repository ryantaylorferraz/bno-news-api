import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import {
  listUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
} from './users.controller';

type Id = { Params: { id: string } };

// Todos os endpoints de usuário exigem autenticação.
// Controle granular por role (ADMIN-only) será adicionado aqui futuramente.
export async function userRoutes(app: FastifyInstance) {
  app.get(       '/',    { preHandler: [authenticate] }, listUsersHandler);
  app.get<Id>(   '/:id', { preHandler: [authenticate] }, getUserByIdHandler);
  app.post(      '/',    { preHandler: [authenticate] }, createUserHandler);
  app.patch<Id>( '/:id', { preHandler: [authenticate] }, updateUserHandler);
}
