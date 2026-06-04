import { z } from 'zod';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
  name:     z.string().min(1, 'Nome obrigatório'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  role:     z.nativeEnum(Role).default('EDITOR'),
});

export const UpdateUserSchema = z.object({
  name:     z.string().min(1, 'Nome obrigatório').optional(),
  email:    z.string().email('E-mail inválido').optional(),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').optional(),
  role:     z.nativeEnum(Role).optional(),
});

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

  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash, role: data.role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  await getUserById(id);

  if (data.email) {
    const conflict = await prisma.user.findFirst({ where: { email: data.email, NOT: { id } } });
    if (conflict) throw new AppError(409, 'Já existe um usuário com este e-mail');
  }

  const { password, ...rest } = data;
  const updateData: Record<string, unknown> = { ...rest };
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, updatedAt: true },
  });
}

export async function deleteUser(id: string) {
  await getUserById(id);
  await prisma.user.delete({ where: { id } });
}
