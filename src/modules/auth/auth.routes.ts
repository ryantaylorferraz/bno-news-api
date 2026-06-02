import { FastifyInstance } from 'fastify';
import { loginHandler, registerHandler } from './auth.controller';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login',    loginHandler);
  app.post('/register', registerHandler);
}
