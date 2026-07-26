import ExcelJS from 'exceljs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { QuoteDetail, QuoteExportResult } from '../../shared/types';
import { QUOTE_ITEM_SOURCE_TYPE_LABELS } from '../../shared/constants/quote-item-source-type';
import { QUOTE_STATUS_LABELS } from '../../shared/constants/quote-status';

function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function currencyFormat(currency: string): string {
  return currency === 'USD' ? '$#,##0.00 [$USD]' : '$#,##0.00 [$MXN]';
}

export class QuoteExportService {
  constructor(private readonly baseDirectory?: string) {}

  buildWorkbook(quote: QuoteDetail): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SIMBO';
    workbook.created = new Date(quote.generatedAt);

    const sheet = workbook.addWorksheet('Cotización', {
      views: [{ state: 'frozen', ySplit: 11 }]
    });
    sheet.properties.defaultRowHeight = 21;
    sheet.columns = [
      { key: 'number', width: 7 },
      { key: 'description', width: 38 },
      { key: 'sourceType', width: 20 },
      { key: 'quantity', width: 13 },
      { key: 'unit', width: 14 },
      { key: 'unitPrice', width: 18 },
      { key: 'amount', width: 18 },
      { key: 'comments', width: 34 }
    ];

    sheet.mergeCells('A1:H1');
    sheet.getCell('A1').value = 'SIMBO · Cotización';
    sheet.getCell('A1').font = { size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF293241' } };
    sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 34;

    sheet.mergeCells('A2:H2');
    sheet.getCell('A2').value = 'BOIS Cocinas y Closets';
    sheet.getCell('A2').font = { bold: true, size: 14, color: { argb: 'FF3E5C76' } };
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    sheet.mergeCells('A3:H3');
    sheet.getCell('A3').value =
      'Blvd. García Morales #812 Local F, Hermosillo, Sonora · Tel. (662) 150 4015';
    sheet.getCell('A3').alignment = { horizontal: 'center' };

    const metadata = [
      ['Proyecto', quote.projectName, 'Cliente', quote.clientName],
      ['Dirección', quote.projectAddress ?? 'Sin dirección', 'Teléfono', quote.clientPhone ?? 'Sin teléfono'],
      ['Correo', quote.clientEmail ?? 'Sin correo', 'Fecha', new Date(quote.generatedAt).toLocaleDateString('es-MX')],
      ['Versión', quote.versionNumber, 'Estado', QUOTE_STATUS_LABELS[quote.status]],
      ['Despiece', quote.cuttingListVersion ? `Versión ${quote.cuttingListVersion}` : 'Sin despiece', 'Moneda', quote.currency]
    ];

    metadata.forEach((row, index) => {
      const excelRow = sheet.getRow(index + 5);
      excelRow.values = [row[0], row[1], '', '', row[2], row[3]];
      excelRow.getCell(1).font = { bold: true };
      excelRow.getCell(5).font = { bold: true };
      sheet.mergeCells(index + 5, 2, index + 5, 4);
      sheet.mergeCells(index + 5, 6, index + 5, 8);
    });

    const headerRow = sheet.getRow(11);
    headerRow.values = [
      '#',
      'Concepto',
      'Tipo',
      'Cantidad',
      'Unidad',
      'Precio unitario',
      'Importe',
      'Comentarios'
    ];
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97D54' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    quote.items.forEach((item, index) => {
      const row = sheet.addRow({
        number: index + 1,
        description: item.description,
        sourceType: QUOTE_ITEM_SOURCE_TYPE_LABELS[item.sourceType],
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        amount: item.amount,
        comments: item.comments
      });
      row.alignment = { vertical: 'top', wrapText: true };
      row.getCell(6).numFmt = currencyFormat(quote.currency);
      row.getCell(7).numFmt = currencyFormat(quote.currency);
      if (index % 2 === 1) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
    });

    const totalsStart = 13 + quote.items.length;
    const totals = [
      ['Subtotal de conceptos', quote.subtotal],
      ['Mano de obra', quote.laborCost],
      ['Costos adicionales', quote.extraCost],
      ['Descuento', -quote.discountAmount],
      [`IVA (${Math.round(quote.taxRate * 100)}%)`, quote.taxAmount],
      ['Total', quote.total],
      ['Anticipo', quote.advancePayment]
    ];

    totals.forEach(([label, amount], index) => {
      const rowNumber = totalsStart + index;
      sheet.mergeCells(rowNumber, 1, rowNumber, 6);
      sheet.getCell(rowNumber, 1).value = label;
      sheet.getCell(rowNumber, 1).alignment = { horizontal: 'right' };
      sheet.getCell(rowNumber, 1).font = { bold: true };
      sheet.mergeCells(rowNumber, 7, rowNumber, 8);
      sheet.getCell(rowNumber, 7).value = amount;
      sheet.getCell(rowNumber, 7).numFmt = currencyFormat(quote.currency);
      sheet.getCell(rowNumber, 7).font = { bold: true };
      if (label === 'Total') {
        sheet.getRow(rowNumber).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE7D7' }
        };
      }
    });

    const notesRow = totalsStart + totals.length + 2;
    sheet.mergeCells(notesRow, 1, notesRow, 8);
    sheet.getCell(notesRow, 1).value = 'Notas';
    sheet.getCell(notesRow, 1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(notesRow, 1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3E5C76' }
    };
    sheet.mergeCells(notesRow + 1, 1, notesRow + 3, 8);
    const notes = [
      ...quote.generationWarnings,
      quote.notes,
      quote.clientDecisionNotes
        ? `Nota de decisión del cliente: ${quote.clientDecisionNotes}`
        : null
    ].filter((value): value is string => Boolean(value));
    sheet.getCell(notesRow + 1, 1).value = notes.length > 0 ? notes.join('\n') : 'Sin notas.';
    sheet.getCell(notesRow + 1, 1).alignment = { vertical: 'top', wrapText: true };

    const approvalRow = notesRow + 5;
    sheet.mergeCells(approvalRow, 1, approvalRow, 3);
    sheet.mergeCells(approvalRow, 6, approvalRow, 8);
    sheet.getCell(approvalRow, 1).value = 'Nombre y firma del cliente';
    sheet.getCell(approvalRow, 6).value = 'Fecha de aprobación';
    sheet.getCell(approvalRow, 1).alignment = { horizontal: 'center' };
    sheet.getCell(approvalRow, 6).alignment = { horizontal: 'center' };
    sheet.getRow(approvalRow - 1).height = 42;

    sheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9E0E5' } },
          left: { style: 'thin', color: { argb: 'FFD9E0E5' } },
          bottom: { style: 'thin', color: { argb: 'FFD9E0E5' } },
          right: { style: 'thin', color: { argb: 'FFD9E0E5' } }
        };
      });
    });

    sheet.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      margins: { left: 0.25, right: 0.25, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 }
    };

    return workbook;
  }

  private async getDefaultOutputDirectory(): Promise<string> {
    const electron = await import('electron');
    return path.join(electron.app.getPath('userData'), 'exports', 'quotes');
  }

  async export(quote: QuoteDetail): Promise<QuoteExportResult> {
    const outputDirectory = this.baseDirectory ?? (await this.getDefaultOutputDirectory());
    await mkdir(outputDirectory, { recursive: true });
    const fileName = `${sanitizeFileName(quote.projectName) || 'proyecto'}-cotizacion-v${quote.versionNumber}.xlsx`;
    const filePath = path.join(outputDirectory, fileName);
    await this.buildWorkbook(quote).xlsx.writeFile(filePath);
    return {
      filePath,
      fileName,
      exportedAt: new Date().toISOString()
    };
  }
}
