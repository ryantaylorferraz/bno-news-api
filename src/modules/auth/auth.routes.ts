import { FastifyInstance } from 'fastify';
import { authenticate, authorizeAdmin } from '../../middleware/auth';
import { loginHandler, registerHandler } from './auth.controller';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', loginHandler);
  app.post('/register', { preHandler: [authenticate, authorizeAdmin] }, registerHandler);
}
