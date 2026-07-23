import type { CuttingRule } from './cutting-rule.types';

export const appliancePlaceholderRule: CuttingRule = {
  generate(context) {
    return {
      pieces: [],
      observations: [`${context.module.name}: no genera piezas; se reserva espacio para electrodoméstico.`]
    };
  }
};
