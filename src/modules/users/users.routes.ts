import { FastifyInstance } from 'fastify';
import { authenticate, authorizeAdmin } from '../../middleware/auth';
import {
  listUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from './users.controller';

type Id = { Params: { id: string } };

const adminOnly = { preHandler: [authenticate, authorizeAdmin] };

export async function userRoutes(app: FastifyInstance) {
  app.get(         '/',    adminOnly, listUsersHandler);
  app.get<Id>(     '/:id', adminOnly, getUserByIdHandler);
  app.post(        '/',    adminOnly, createUserHandler);
  app.patch<Id>(   '/:id', adminOnly, updateUserHandler);
  app.delete<Id>(  '/:id', adminOnly, deleteUserHandler);
}
