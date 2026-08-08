import { DashboardRepository } from '../domain/dashboard.repository';

export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  getSummary() {
    return this.repository.getSummary();
  }

  getMovementsChart(days: number) {
    return this.repository.getMovementsChart(days);
  }

  getLowStock() {
    return this.repository.getLowStock();
  }

  getTopProducts(limit: number) {
    return this.repository.getTopProducts(limit);
  }

  getExpiringSoon(days: number) {
    return this.repository.getExpiringSoon(days);
  }
}