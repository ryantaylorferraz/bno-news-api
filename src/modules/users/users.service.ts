import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
  name:         z.string().min(1, 'Nome obrigatório'),
  email:        z.string().email('E-mail inválido'),
  passwordHash: z.string().min(1, 'Password hash obrigatório'),
  role:         z.nativeEnum(Role).default('EDITOR'),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// ── Operações ─────────────────────────────────────────────────────────────────

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  if (!user) throw new AppError(404, 'Usuário não encontrado');
  return user;
}

export async function createUser(data: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, 'Já existe um usuário com este e-mail');
  return prisma.user.create({
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  await getUserById(id);

  if (data.email) {
    const conflict = await prisma.user.findFirst({ where: { email: data.email, NOT: { id } } });
    if (conflict) throw new AppError(409, 'Já existe um usuário com este e-mail');
  }

  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, updatedAt: true },
  });
}
