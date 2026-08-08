import { Request, Response, NextFunction } from 'express';
import { ReportsService } from '../application/reports.service';
import { generateExcel, generateCSV, generatePDF } from '../../../shared/generators/report-generators';

export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  readonly movements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = (req.query.format as string) || 'pdf';
      const filters: Record<string, unknown> = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;

      const data = await this.reportsService.getMovementsReport(filters);
      const flatData = data.map((m) => ({
        'Código': m.product.internalCode,
        'Produto': m.product.name,
        'Tipo': m.type === 'ENTRY' ? 'Entrada' : 'Saída',
        'Quantidade': m.quantity,
        'Estoque Anterior': m.previousStock,
        'Novo Estoque': m.newStock,
        'Responsável': m.user.name,
        'Fornecedor': m.supplier?.name || '-',
        'Data': new Date(m.createdAt).toLocaleDateString('pt-BR'),
      }));

      if (format === 'excel') {
        const buffer = generateExcel(flatData, 'Movimentações');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=movimentacoes.xlsx');
        return res.send(buffer);
      }

      if (format === 'csv') {
        const csv = generateCSV(flatData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=movimentacoes.csv');
        return res.send(csv);
      }

      const columns = ['Código', 'Produto', 'Tipo', 'Quantidade', 'Estoque Anterior', 'Novo Estoque', 'Responsável', 'Data'];
      const pdf = await generatePDF(flatData, 'Relatório de Movimentações', columns);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=movimentacoes.pdf');
      return res.send(pdf);
    } catch (err) { next(err); }
  };

  readonly products = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = (req.query.format as string) || 'pdf';
      const data = await this.reportsService.getProductsReport();
      const flatData = data.map((p) => ({
        'Código': p.internalCode,
        'Nome': p.name,
        'Marca': p.brand?.name,
        'Categoria': p.category?.name,
        'Preço Custo': Number(p.costPrice),
        'Preço Venda': Number(p.salePrice),
        'Estoque': p.currentStock,
        'Mínimo': p.minStock,
      }));

      if (format === 'excel') {
        const buffer = generateExcel(flatData, 'Produtos');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=produtos.xlsx');
        return res.send(buffer);
      }

      if (format === 'csv') {
        const csv = generateCSV(flatData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=produtos.csv');
        return res.send(csv);
      }

      const columns = ['Código', 'Nome', 'Marca', 'Categoria', 'Preço Custo', 'Preço Venda', 'Estoque', 'Mínimo'];
      const pdf = await generatePDF(flatData, 'Relatório de Produtos', columns);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=produtos.pdf');
      return res.send(pdf);
    } catch (err) { next(err); }
  };

  readonly lowStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = (req.query.format as string) || 'pdf';
      const rows = await this.reportsService.getLowStockReport();
      const data: Record<string, unknown>[] = rows.map((r) => ({ ...r }));

      if (format === 'excel') {
        const buffer = generateExcel(data, 'Estoque Baixo');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=estoque-baixo.xlsx');
        return res.send(buffer);
      }

      if (format === 'csv') {
        const csv = generateCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=estoque-baixo.csv');
        return res.send(csv);
      }

      const columns = ['name', 'internalCode', 'currentStock', 'minStock', 'brand_name', 'category_name'];
      const pdf = await generatePDF(data, 'Relatório de Estoque Baixo', columns);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=estoque-baixo.pdf');
      return res.send(pdf);
    } catch (err) { next(err); }
  };
}