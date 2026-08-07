import { describe, it, expect } from 'vitest';
import { reportsService } from '@/modules/reports/reports.service';

describe('ReportsService.generateCSV', () => {
  it('deve gerar CSV com cabeçalho e linhas', () => {
    const csv = reportsService.generateCSV([
      { name: 'Biscoito', quantity: 3 },
      { name: 'Bolo', quantity: 1 },
    ]);

    const lines = csv.split('\n');
    expect(lines[0]).toBe('"name","quantity"');
    expect(lines[1]).toBe('"Biscoito","3"');
    expect(lines[2]).toBe('"Bolo","1"');
  });

  it('deve neutralizar injeção de fórmula no CSV', () => {
    const csv = reportsService.generateCSV([
      { name: '=HYPERLINK("http://evil.com")', quantity: 1 },
      { name: '+SUM(A1:A2)', quantity: 2 },
      { name: '-2+3', quantity: 3 },
      { name: '@cmd', quantity: 4 },
    ]);

    const lines = csv.split('\n');
    expect(lines[1]).toContain('"' + "'=HYPERLINK");
    expect(lines[2]).toContain('"' + "'+SUM");
    expect(lines[3]).toContain('"' + "'-2+3");
    expect(lines[4]).toContain('"' + "'@cmd");
  });

  it('deve escapar aspas duplas dentro de valores', () => {
    const csv = reportsService.generateCSV([{ name: 'Biscoito "Recheado"' }]);
    expect(csv).toBe('"name"\n"Biscoito ""Recheado"""');
  });

  it('deve retornar string vazia para lista vazia', () => {
    expect(reportsService.generateCSV([])).toBe('');
  });
});