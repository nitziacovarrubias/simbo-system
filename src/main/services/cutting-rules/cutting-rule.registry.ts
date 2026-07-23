import type { DesignModuleType } from '../../../shared/types';
import { appliancePlaceholderRule } from './appliance-placeholder.rule';
import { baseCabinetRule } from './base-cabinet.rule';
import type { CuttingRule } from './cutting-rule.types';
import { islandRule } from './island.rule';
import { shelfRule } from './shelf.rule';
import { tallCabinetRule } from './tall-cabinet.rule';
import { wallCabinetRule } from './wall-cabinet.rule';

const CUTTING_RULES: Record<DesignModuleType, CuttingRule> = {
  BASE_CABINET: baseCabinetRule,
  WALL_CABINET: wallCabinetRule,
  TALL_CABINET: tallCabinetRule,
  SHELF: shelfRule,
  ISLAND: islandRule,
  APPLIANCE_PLACEHOLDER: appliancePlaceholderRule
};

export function getCuttingRule(moduleType: string): CuttingRule {
  const rule = CUTTING_RULES[moduleType as DesignModuleType];
  if (!rule) {
    throw new Error(`No existe una regla de despiece para el módulo ${moduleType}.`);
  }
  return rule;
}
