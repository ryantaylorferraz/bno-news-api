import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

// ── Helper interno ────────────────────────────────────────────────────────────

type AuthUser = { id: string; name: string; email: string; role: string };

function signToken(user: AuthUser): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError(500, 'JWT_SECRET não configurado no servidor');

  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
  );
}

// ── Operações ─────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, 'Credenciais inválidas');
  }

  return { token: signToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function register(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'E-mail já cadastrado');

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'EDITOR' },
    select: { id: true, name: true, email: true, role: true },
  });

  return { token: signToken(user), user };
}
