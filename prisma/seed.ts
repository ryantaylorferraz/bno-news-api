import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // ── Usuário admin ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@bno.com.br' },
    update: {},
    create: {
      name:         'Admin BNO',
      email:        'admin@bno.com.br',
      passwordHash,
      role:         'ADMIN',
    },
  });

  console.log(`Usuário admin: ${admin.email} (${admin.role})`);

  // ── Categorias ────────────────────────────────────────────────────────────
  const categories = [
    { name: 'Política',   slug: 'politica',   order: 1 },
    { name: 'Tecnologia', slug: 'tecnologia', order: 2 },
  ];

  for (const data of categories) {
    const category = await prisma.category.upsert({
      where:  { slug: data.slug },
      update: {},
      create: data,
    });
    console.log(`Categoria: ${category.name} (/${category.slug})`);
  }

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
