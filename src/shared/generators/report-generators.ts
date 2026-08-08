import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';

export function generatePDF(data: Record<string, unknown>[], title: string, columns: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    const pageWidth = doc.page.width - 80;

    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#666666')
      .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'right' });
    doc.moveDown(0.5);

    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#CCCCCC').lineWidth(0.5).stroke();
    doc.moveDown(0.8);

    const colWidth = pageWidth / columns.length;
    const rowHeight = 28;
    const padding = 8;
    let y = doc.y;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.rect(40, y - 4, pageWidth, rowHeight).fill('#F59E0B');
    columns.forEach((col, i) => {
      doc.fillColor('#FFFFFF').text(col, 40 + i * colWidth + padding, y + 4, {
        width: colWidth - padding * 2,
        align: 'left',
        lineBreak: false,
      });
    });
    y += rowHeight + 4;

    doc.font('Helvetica').fontSize(8);
    data.forEach((row, rowIndex) => {
      if (y + rowHeight > doc.page.height - 60) {
        doc.addPage();
        y = 40;
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
        doc.rect(40, y - 4, pageWidth, rowHeight).fill('#F59E0B');
        columns.forEach((col, i) => {
          doc.fillColor('#FFFFFF').text(col, 40 + i * colWidth + padding, y + 4, {
            width: colWidth - padding * 2,
            align: 'left',
            lineBreak: false,
          });
        });
        y += rowHeight + 4;
        doc.font('Helvetica').fontSize(8);
      }

      if (rowIndex % 2 === 0) {
        doc.rect(40, y - 4, pageWidth, rowHeight).fill('#FEF3C7');
      }

      doc.fillColor('#1F2937');
      columns.forEach((col, i) => {
        const value = String(row[col] ?? '-');
        doc.text(value.substring(0, 40), 40 + i * colWidth + padding, y + 4, {
          width: colWidth - padding * 2,
          align: 'left',
          lineBreak: false,
        });
      });

      y += rowHeight;
      doc.moveTo(40, y - 4).lineTo(doc.page.width - 40, y - 4).strokeColor('#E5E7EB').lineWidth(0.3).stroke();
    });

    doc.moveDown(2);
    doc.fontSize(9).font('Helvetica').fillColor('#666666')
      .text(`Total de registros: ${data.length}`, 40, doc.y, { align: 'left' });

    doc.end();
  });
}

export function generateExcel(data: Record<string, unknown>[], title: string): Buffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, title);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export function generateCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvCell = (value: unknown): string => {
    let s = value == null ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = data.map((row) => headers.map((h) => csvCell(row[h])).join(','));
  return [headers.map(csvCell).join(','), ...rows].join('\n');
}