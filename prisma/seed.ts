import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds...');

  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@casadobiscoito.com.br' },
  });

  if (!adminExists) {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@casadobiscoito.com.br',
        passwordHash,
        role: UserRole.ADMIN,
      },
    });
    console.log('✅ Usuário admin criado');
  }

  const categories = [
    'Biscoitos',
    'Bolachas',
    'Salgadinhos',
    'Doces',
    'Chocolates',
    'Bebidas',
    'Outros',
  ];

  for (const name of categories) {
    const exists = await prisma.category.findUnique({ where: { name } });
    if (!exists) {
      await prisma.category.create({ data: { name } });
      console.log(`✅ Categoria "${name}" criada`);
    }
  }

  const brands = ['Bauducco', 'Nestlé', 'Marilan', 'Tostines', 'Piraquê', 'Isabela'];

  for (const name of brands) {
    const exists = await prisma.brand.findUnique({ where: { name } });
    if (!exists) {
      await prisma.brand.create({ data: { name } });
      console.log(`✅ Marca "${name}" criada`);
    }
  }

  console.log('🌱 Seeds concluídos!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
