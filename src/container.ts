import { PrismaAuthRepository } from './modules/auth/infrastructure/prisma-auth.repository';
import { AuthService } from './modules/auth/application/auth.service';
import { AuthController } from './modules/auth/presentation/auth.controller';
import { createAuthRouter } from './modules/auth/presentation/auth.routes';

import { PrismaUserRepository } from './modules/users/infrastructure/prisma-user.repository';
import { UsersService } from './modules/users/application/users.service';
import { UsersController } from './modules/users/presentation/users.controller';
import { createUsersRouter } from './modules/users/presentation/users.routes';

import { PrismaBrandRepository } from './modules/brands/infrastructure/prisma-brand.repository';
import { BrandsService } from './modules/brands/application/brands.service';
import { BrandsController } from './modules/brands/presentation/brands.controller';
import { createBrandsRouter } from './modules/brands/presentation/brands.routes';

import { PrismaCategoryRepository } from './modules/categories/infrastructure/prisma-category.repository';
import { CategoriesService } from './modules/categories/application/categories.service';
import { CategoriesController } from './modules/categories/presentation/categories.controller';
import { createCategoriesRouter } from './modules/categories/presentation/categories.routes';

import { PrismaSupplierRepository } from './modules/suppliers/infrastructure/prisma-supplier.repository';
import { SuppliersService } from './modules/suppliers/application/suppliers.service';
import { SuppliersController } from './modules/suppliers/presentation/suppliers.controller';
import { createSuppliersRouter } from './modules/suppliers/presentation/suppliers.routes';

import { PrismaProductRepository } from './modules/products/infrastructure/prisma-product.repository';
import { ProductsService } from './modules/products/application/products.service';
import { ProductsController } from './modules/products/presentation/products.controller';
import { createProductsRouter } from './modules/products/presentation/products.routes';

import { PrismaStockMovementRepository } from './modules/stock-movements/infrastructure/prisma-stock-movement.repository';
import { StockMovementsService } from './modules/stock-movements/application/stock-movements.service';
import { StockMovementsController } from './modules/stock-movements/presentation/stock-movements.controller';
import { createStockMovementsRouter } from './modules/stock-movements/presentation/stock-movements.routes';

import { PrismaDashboardRepository } from './modules/dashboard/infrastructure/prisma-dashboard.repository';
import { DashboardService } from './modules/dashboard/application/dashboard.service';
import { DashboardController } from './modules/dashboard/presentation/dashboard.controller';
import { createDashboardRouter } from './modules/dashboard/presentation/dashboard.routes';

import { PrismaReportsRepository } from './modules/reports/infrastructure/prisma-reports.repository';
import { ReportsService } from './modules/reports/application/reports.service';
import { ReportsController } from './modules/reports/presentation/reports.controller';
import { createReportsRouter } from './modules/reports/presentation/reports.routes';

import { BcryptPasswordHasher } from './shared/security/bcrypt-password-hasher';
import { JwtTokenService } from './shared/security/jwt-token.service';

const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();

const authRepository = new PrismaAuthRepository();
const authService = new AuthService(authRepository, passwordHasher, tokenService);
const authController = new AuthController(authService);

const userRepository = new PrismaUserRepository();
const usersService = new UsersService(userRepository, passwordHasher);
const usersController = new UsersController(usersService);

const brandRepository = new PrismaBrandRepository();
const brandsService = new BrandsService(brandRepository);
const brandsController = new BrandsController(brandsService);

const categoryRepository = new PrismaCategoryRepository();
const categoriesService = new CategoriesService(categoryRepository);
const categoriesController = new CategoriesController(categoriesService);

const supplierRepository = new PrismaSupplierRepository();
const suppliersService = new SuppliersService(supplierRepository);
const suppliersController = new SuppliersController(suppliersService);

const productRepository = new PrismaProductRepository();
const productsService = new ProductsService(productRepository);
const productsController = new ProductsController(productsService);

const stockMovementRepository = new PrismaStockMovementRepository();
const stockMovementsService = new StockMovementsService(stockMovementRepository);
const stockMovementsController = new StockMovementsController(stockMovementsService);

const dashboardRepository = new PrismaDashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

const reportsRepository = new PrismaReportsRepository();
const reportsService = new ReportsService(reportsRepository);
const reportsController = new ReportsController(reportsService);

export const routes = {
  auth: createAuthRouter(authController),
  users: createUsersRouter(usersController),
  brands: createBrandsRouter(brandsController),
  categories: createCategoriesRouter(categoriesController),
  suppliers: createSuppliersRouter(suppliersController),
  products: createProductsRouter(productsController),
  stockMovements: createStockMovementsRouter(stockMovementsController),
  dashboard: createDashboardRouter(dashboardController),
  reports: createReportsRouter(reportsController),
};