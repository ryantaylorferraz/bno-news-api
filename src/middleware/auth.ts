import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

// Extends FastifyRequest to carry the authenticated user across handlers.
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Token de autenticação não fornecido');
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError(500, 'JWT_SECRET não configurado no servidor');
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    request.user = { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    throw new AppError(401, 'Token inválido ou expirado');
  }
}
