export interface QuoteCalculatorItem {
  quantity: number;
  unitPrice: number;
  sourceType?: string;
}

export interface QuoteCalculatorInput {
  items: QuoteCalculatorItem[];
  laborCost: number;
  extraCost?: number;
  taxRate: number;
  discountAmount: number;
  advancePayment: number;
}

export interface QuoteTotals {
  subtotal: number;
  taxAmount: number;
  laborCost: number;
  extraCost: number;
  discountAmount: number;
  advancePayment: number;
  total: number;
}

export interface QuoteMaterialPiece {
  id?: string;
  materialId: string | null;
  materialName: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  materialCost: number;
}

export interface MaterialQuoteGroup {
  materialId: string | null;
  materialName: string;
  areaM2: number;
  unitPrice: number;
  amount: number;
  pieceIds: string[];
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundArea(value: number): number {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}

export function calculatePieceAreaM2(
  widthMm: number,
  heightMm: number,
  quantity: number
): number {
  return roundArea((widthMm * heightMm * quantity) / 1_000_000);
}

export function groupCuttingPiecesByMaterial(
  pieces: QuoteMaterialPiece[]
): MaterialQuoteGroup[] {
  const groups = new Map<string, MaterialQuoteGroup>();

  for (const piece of pieces) {
    const key = piece.materialId ?? `name:${piece.materialName}`;
    const areaM2 = (piece.widthMm * piece.heightMm * piece.quantity) / 1_000_000;
    const current = groups.get(key) ?? {
      materialId: piece.materialId,
      materialName: piece.materialName,
      areaM2: 0,
      unitPrice: Math.max(piece.materialCost, 0),
      amount: 0,
      pieceIds: []
    };

    current.areaM2 += areaM2;
    if (piece.materialCost > 0) current.unitPrice = piece.materialCost;
    if (piece.id) current.pieceIds.push(piece.id);
    groups.set(key, current);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      areaM2: roundArea(group.areaM2),
      amount: roundCurrency(roundArea(group.areaM2) * group.unitPrice)
    }))
    .sort((a, b) => a.materialName.localeCompare(b.materialName, 'es'));
}

export function calculateSuggestedLabor(materialSubtotal: number): number {
  return roundCurrency(materialSubtotal * 0.35);
}

export function calculateSuggestedAdvance(total: number): number {
  return roundCurrency(total * 0.5);
}

export function validateDiscountAmount(discountAmount: number, baseAmount: number): void {
  if (discountAmount > baseAmount) {
    throw new Error('El descuento no puede ser mayor al subtotal, mano de obra y costos adicionales.');
  }
}

export function calculateQuoteTotals(input: QuoteCalculatorInput): QuoteTotals {
  const subtotal = input.items.reduce(
    (total, item) => total + roundCurrency(item.quantity * item.unitPrice),
    0
  );
  const laborCost = input.laborCost;
  const extraCost = input.extraCost ?? 0;
  const discountAmount = input.discountAmount;
  const baseAmount = subtotal + laborCost + extraCost;
  validateDiscountAmount(discountAmount, baseAmount);
  const taxableBase = baseAmount - discountAmount;
  const taxAmount = taxableBase * input.taxRate;
  const total = taxableBase + taxAmount;

  return {
    subtotal: roundCurrency(subtotal),
    taxAmount: roundCurrency(taxAmount),
    laborCost: roundCurrency(laborCost),
    extraCost: roundCurrency(extraCost),
    discountAmount: roundCurrency(discountAmount),
    advancePayment: roundCurrency(input.advancePayment),
    total: roundCurrency(total)
  };
}
