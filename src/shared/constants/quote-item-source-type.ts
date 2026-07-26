export { QuoteItemSourceType } from './domain.enums';

export const QUOTE_ITEM_SOURCE_TYPE_LABELS = {
  MATERIAL: 'Material',
  LABOR: 'Mano de obra',
  EXTRA: 'Costo adicional',
  DISCOUNT: 'Descuento',
  CUSTOM: 'Personalizado'
} as const;
