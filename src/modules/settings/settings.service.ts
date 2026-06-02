import { z } from 'zod';
import { prisma } from '../../lib/prisma';

// ── Schema ────────────────────────────────────────────────────────────────────

export const UpsertSettingsSchema = z.record(z.string(), z.string());

export type SettingsMap = Record<string, string>;

// ── Operações ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<SettingsMap> {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function upsertSettings(data: SettingsMap): Promise<SettingsMap> {
  await prisma.$transaction(
    Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({
        where:  { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );

  return getSettings();
}
