import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { AppError } from './errors/AppError';
import { routes } from './routes';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  });

  // ── Plugins ───────────────────────────────────────────────────────────────
  app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? '*',
  });

  // ── Error handler global ──────────────────────────────────────────────────
  app.setErrorHandler((error: unknown, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error:   'Dados inválidos',
        details: error.flatten().fieldErrors,
      });
    }

    // Erros de parse/validação do próprio Fastify (ex: JSON malformado)
    const statusCode = (error as { statusCode?: number }).statusCode;
    const message    = error instanceof Error ? error.message : 'Erro interno do servidor';

    if (statusCode === 400) {
      return reply.status(400).send({ error: message });
    }

    app.log.error(error);
    return reply.status(500).send({ error: 'Erro interno do servidor' });
  });

  // ── Rotas ─────────────────────────────────────────────────────────────────
  app.register(routes, { prefix: '/api' });

  return app;
}
