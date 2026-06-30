import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { errorMiddleware } from './shared/middlewares/error.middleware';
import { logger } from './shared/utils/logger';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import brandsRoutes from './modules/brands/brands.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import suppliersRoutes from './modules/suppliers/suppliers.routes';
import productsRoutes from './modules/products/products.routes';
import stockMovementsRoutes from './modules/stock-movements/stock-movements.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import reportsRoutes from './modules/reports/reports.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Muitas requisições. Tente novamente mais tarde.', code: 'RATE_LIMIT' },
});
app.use(limiter);

app.use('/uploads', express.static(path.resolve(env.UPLOAD_PATH)));

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/brands', brandsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/suppliers', suppliersRoutes);
app.use('/products', productsRoutes);
app.use('/stock-movements', stockMovementsRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reports', reportsRoutes);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Box-Inteligente API está funcionando', timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

app.listen(env.PORT, () => {
  logger.info(`🚀 Servidor Box-Inteligente rodando na porta ${env.PORT}`);
  logger.info(`📦 Ambiente: ${env.NODE_ENV}`);
});

export default app;
