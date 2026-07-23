import ExcelJS from 'exceljs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { CuttingListDetail, CuttingListExportResult } from '../../shared/types';
import { EDGE_BANDING_LABELS } from '../../shared/constants/edge-banding';
import { GRAIN_DIRECTION_LABELS } from '../../shared/constants/grain-direction';

function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function formatMeasures(widthMm: number, heightMm: number, depthMm: number | null): string {
  return depthMm
    ? `${widthMm} x ${heightMm} x ${depthMm} mm`
    : `${widthMm} x ${heightMm} mm`;
}

export class CuttingListExportService {
  constructor(private readonly baseDirectory?: string) {}

  buildWorkbook(list: CuttingListDetail): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SIMBO';
    workbook.created = new Date(list.generatedAt);

    const sheet = workbook.addWorksheet('Despiece', {
      views: [{ state: 'frozen', ySplit: 8 }]
    });
    sheet.properties.defaultRowHeight = 20;
    sheet.columns = [
      { key: 'number', width: 7 },
      { key: 'module', width: 24 },
      { key: 'piece', width: 25 },
      { key: 'quantity', width: 11 },
      { key: 'material', width: 25 },
      { key: 'thickness', width: 12 },
      { key: 'measures', width: 24 },
      { key: 'grain', width: 18 },
      { key: 'edge', width: 20 },
      { key: 'comments', width: 36 }
    ];

    sheet.mergeCells('A1:J1');
    sheet.getCell('A1').value = 'SIMBO · Lista de despiece';
    sheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF293241' } };
    sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 32;

    const metadata = [
      ['Proyecto', list.projectName, 'Cliente', list.clientName],
      ['Versión', list.versionNumber, 'Estado', list.status],
      ['Diseño', list.designTitle ?? 'Sin diseño', 'Versión diseño', list.designVersion ?? 'N/A'],
      ['Generado', new Date(list.generatedAt).toLocaleString('es-MX'), 'Observaciones', list.notes || 'Sin observaciones']
    ];

    metadata.forEach((row, index) => {
      const excelRow = sheet.getRow(index + 3);
      excelRow.values = [row[0], row[1], '', row[2], row[3]];
      excelRow.getCell(1).font = { bold: true };
      excelRow.getCell(4).font = { bold: true };
    });

    const headerRow = sheet.getRow(8);
    headerRow.values = [
      '#',
      'Módulo origen',
      'Concepto / pieza',
      'Cantidad',
      'Material',
      'Espesor (mm)',
      'Medidas',
      'Orientación de veta',
      'Canteado',
      'Comentarios'
    ];
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3E5C76' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    list.pieces.forEach((piece, index) => {
      const row = sheet.addRow({
        number: index + 1,
        module: piece.sourceModuleName,
        piece: piece.pieceName,
        quantity: piece.quantity,
        material: piece.materialName,
        thickness: piece.thicknessMm,
        measures: formatMeasures(piece.widthMm, piece.heightMm, piece.depthMm),
        grain: GRAIN_DIRECTION_LABELS[piece.grainDirection],
        edge: EDGE_BANDING_LABELS[piece.edgeBanding],
        comments: piece.comments
      });
      row.alignment = { vertical: 'top', wrapText: true };
      if (index % 2 === 1) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
    });

    const tableEnd = 8 + list.pieces.length;
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
    sheet.autoFilter = { from: 'A8', to: `J${Math.max(tableEnd, 8)}` };
    sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1 };

    const summarySheet = workbook.addWorksheet('Resumen materiales');
    summarySheet.columns = [
      { key: 'material', width: 32 },
      { key: 'thickness', width: 16 },
      { key: 'concepts', width: 18 },
      { key: 'quantity', width: 18 },
      { key: 'area', width: 22 }
    ];
    summarySheet.mergeCells('A1:E1');
    summarySheet.getCell('A1').value = 'Totales por material';
    summarySheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF293241' } };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };
    summarySheet.getRow(3).values = ['Material', 'Espesor (mm)', 'Conceptos', 'Cantidad total', 'Área estimada (m²)'];
    summarySheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3E5C76' } };
    list.materialSummary.forEach((summary) => {
      summarySheet.addRow({
        material: summary.materialName,
        thickness: summary.thicknessMm,
        concepts: summary.piecesCount,
        quantity: summary.totalQuantity,
        area: summary.totalAreaSquareMeters
      });
    });

    return workbook;
  }

  private async getDefaultOutputDirectory(): Promise<string> {
    const electron = await import('electron');
    return path.join(electron.app.getPath('userData'), 'exports', 'cutting-lists');
  }

  async export(list: CuttingListDetail): Promise<CuttingListExportResult> {
    const outputDirectory = this.baseDirectory ?? (await this.getDefaultOutputDirectory());
    await mkdir(outputDirectory, { recursive: true });

    const fileName = `${sanitizeFileName(list.projectName) || 'proyecto'}-despiece-v${list.versionNumber}.xlsx`;
    const filePath = path.join(outputDirectory, fileName);
    await this.buildWorkbook(list).xlsx.writeFile(filePath);

    return {
      filePath,
      fileName,
      exportedAt: new Date().toISOString()
    };
  }
}
