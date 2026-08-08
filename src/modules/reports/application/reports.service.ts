import { ReportsRepository } from '../domain/reports.repository';

export class ReportsService {
  constructor(private readonly repository: ReportsRepository) {}

  getMovementsReport(filters: Record<string, unknown>) {
    return this.repository.getMovementsReport(filters);
  }

  getProductsReport() {
    return this.repository.getProductsReport();
  }

  getLowStockReport() {
    return this.repository.getLowStockReport();
  }
}