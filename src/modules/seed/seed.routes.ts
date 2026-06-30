import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@casadobiscoito.com.br' } });
    if (!adminExists) {
      const passwordHash = await bcrypt.hash('Admin@123', 12);
      await prisma.user.create({
        data: { name: 'Administrador', email: 'admin@casadobiscoito.com.br', passwordHash, role: 'ADMIN' },
      });
    }
    const categories = ['Biscoitos', 'Bolachas', 'Salgadinhos', 'Doces', 'Chocolates', 'Bebidas', 'Outros'];
    for (const name of categories) {
      const exists = await prisma.category.findUnique({ where: { name } });
      if (!exists) await prisma.category.create({ data: { name } });
    }
    const brands = ['Bauducco', 'Nestlé', 'Marilan', 'Tostines', 'Piraquê', 'Isabela'];
    for (const name of brands) {
      const exists = await prisma.brand.findUnique({ where: { name } });
      if (!exists) await prisma.brand.create({ data: { name } });
    }
    res.json({ success: true, message: 'Seed executado com sucesso' });
  } catch (error) {
    console.error('Erro no seed:', error);
    res.status(500).json({ success: false, error: 'Erro ao executar seed' });
  }
});

export default router;
