import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const adminExists = await prisma.user.findFirst({ where: { email: 'admin@casadobiscoito.com.br' } });
    if (!adminExists) {
      const passwordHash = await bcrypt.hash('Admin@123', 12);
      await prisma.user.create({
        data: { name: 'Administrador', email: 'admin@casadobiscoito.com.br', passwordHash, role: 'ADMIN' },
      });
    }
    const categories = ['Biscoitos', 'Bolachas', 'Salgadinhos', 'Doces', 'Chocolates', 'Bebidas', 'Outros'];
    for (const name of categories) {
      const exists = await prisma.category.findFirst({ where: { name } });
      if (!exists) await prisma.category.create({ data: { name } });
    }
    const brands = ['Bauducco', 'Nestlé', 'Marilan', 'Tostines', 'Piraquê', 'Isabela'];
    for (const name of brands) {
      const exists = await prisma.brand.findFirst({ where: { name } });
      if (!exists) await prisma.brand.create({ data: { name } });
    }
    res.json({ success: true, message: 'Seed executado com sucesso' });
  } catch (error) {
    console.error('Erro no seed:', error);
    res.status(500).json({ success: false, error: 'Erro ao executar seed' });
  }
});

router.get('/debug', async (_req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'admin@casadobiscoito.com.br' } });
    if (!user) return res.json({ userExists: false });
    const testHash = await bcrypt.hash('Admin@123', 12);
    const compare = await bcrypt.compare('Admin@123', user.passwordHash);
    res.json({
      userExists: true,
      email: user.email,
      role: user.role,
      active: user.active,
      passwordHashLength: user.passwordHash.length,
      bcryptWorks: compare,
      bcryptVersion: bcrypt.getRounds(user.passwordHash),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

export default router;
