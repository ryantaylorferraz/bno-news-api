import { z } from 'zod';
import { TipStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const CreateTipSchema = z.object({
  subject:   z.string().min(3,  'Assunto obrigatório (mínimo 3 caracteres)'),
  body:      z.string().min(10, 'Descrição obrigatória (mínimo 10 caracteres)'),
  category:  z.string().optional().nullable(),
  location:  z.string().optional().nullable(),
  anonymous: z.boolean().default(false),
  name:      z.string().optional().nullable(),
  email:     z.string().email('E-mail inválido').optional().nullable(),
  phone:     z.string().optional().nullable(),
});

export const UpdateTipStatusSchema = z.object({
  status: z.nativeEnum(TipStatus),
});

export type CreateTipInput       = z.infer<typeof CreateTipSchema>;
export type UpdateTipStatusInput = z.infer<typeof UpdateTipStatusSchema>;

// ── Operações ─────────────────────────────────────────────────────────────────

export async function createTip(data: CreateTipInput) {
  const sanitized = data.anonymous
    ? { ...data, name: null, email: null, phone: null }
    : data;
  return prisma.tip.create({ data: sanitized });
}

export async function listTips(params: {
  status?: TipStatus;
  page?:   number;
  limit?:  number;
}) {
  const { status, page = 1, limit = 20 } = params;
  const where = status ? { status } : {};

  const [data, total] = await Promise.all([
    prisma.tip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tip.count({ where }),
  ]);

  return { data, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getTipById(id: string) {
  const tip = await prisma.tip.findUnique({ where: { id } });
  if (!tip) throw new AppError(404, 'Pauta não encontrada');
  return tip;
}

export async function updateTipStatus(id: string, data: UpdateTipStatusInput) {
  await getTipById(id);
  return prisma.tip.update({ where: { id }, data });
}
