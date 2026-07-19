export interface QuoteCalculatorItem {
  quantity: number;
  unitPrice: number;
}

export interface QuoteCalculatorInput {
  items: QuoteCalculatorItem[];
  laborCost: number;
  taxRate: number;
  discountAmount: number;
  advancePayment: number;
}

export interface QuoteTotals {
  subtotal: number;
  taxAmount: number;
  laborCost: number;
  discountAmount: number;
  advancePayment: number;
  total: number;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateQuoteTotals(input: QuoteCalculatorInput): QuoteTotals {
  const subtotal = input.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const taxableBase = Math.max(subtotal + input.laborCost - input.discountAmount, 0);
  const taxAmount = taxableBase * input.taxRate;
  const total = taxableBase + taxAmount;

  return {
    subtotal: roundCurrency(subtotal),
    taxAmount: roundCurrency(taxAmount),
    laborCost: roundCurrency(input.laborCost),
    discountAmount: roundCurrency(input.discountAmount),
    advancePayment: roundCurrency(input.advancePayment),
    total: roundCurrency(total),
  };
}
