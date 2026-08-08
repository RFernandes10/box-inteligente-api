import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorMiddleware } from './shared/middlewares/error.middleware';
import { logger } from './shared/utils/logger';

import { routes } from './container';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Muitas requisições. Tente novamente mais tarde.', code: 'RATE_LIMIT' },
});
app.use(limiter);

app.use('/uploads', express.static(path.resolve(env.UPLOAD_PATH)));

app.use('/api/auth', routes.auth);
app.use('/api/users', routes.users);
app.use('/api/brands', routes.brands);
app.use('/api/categories', routes.categories);
app.use('/api/suppliers', routes.suppliers);
app.use('/api/products', routes.products);
app.use('/api/stock-movements', routes.stockMovements);
app.use('/api/dashboard', routes.dashboard);
app.use('/api/reports', routes.reports);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Box-Inteligente API está funcionando', timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

app.listen(env.PORT, () => {
  logger.info(`🚀 Servidor Box-Inteligente rodando na porta ${env.PORT}`);
  logger.info(`📦 Ambiente: ${env.NODE_ENV}`);
});

export default app;
