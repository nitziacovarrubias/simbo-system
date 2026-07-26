import type { Currency, QuoteItemSourceType, QuoteStatus } from '../constants/domain.enums';

export interface QuoteItem {
  id: string;
  quoteId: string;
  materialId: string | null;
  sourceType: QuoteItemSourceType;
  sourcePieceId: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  comments: string;
  isManual: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItemInput {
  materialId?: string | null;
  sourceType: QuoteItemSourceType;
  sourcePieceId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  comments?: string;
  sortOrder?: number;
}

export interface QuoteAdjustmentsInput {
  taxRate: number;
  laborCost: number;
  extraCost: number;
  discountAmount: number;
  advancePayment: number;
  notes?: string;
}

export interface QuoteSummary {
  id: string;
  projectId: string;
  cuttingListId: string | null;
  versionNumber: number;
  status: QuoteStatus;
  subtotal: number;
  taxAmount: number;
  laborCost: number;
  extraCost: number;
  discountAmount: number;
  advancePayment: number;
  total: number;
  currency: Currency;
  itemsCount: number;
  generatedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  exportedAt: string | null;
  isLatestVersion: boolean;
  isSourceOutdated: boolean;
  updatedAt: string;
}

export interface QuoteDetail extends QuoteSummary {
  projectName: string;
  projectStatus: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  projectAddress: string | null;
  cuttingListVersion: number | null;
  cuttingListStatus: string | null;
  taxRate: number;
  notes: string;
  clientDecisionNotes: string;
  generationWarnings: string[];
  items: QuoteItem[];
}

export interface QuoteExportResult {
  filePath: string;
  fileName: string;
  exportedAt: string;
}
