export type MaterialType = "tworzywo" | "barwnik";

export interface Material {
  id: string;
  symbol: string;
  type: MaterialType;
  priceZlKg: number;
}

export interface Machine {
  id: string;
  name: string;
  rateZlH: number;
}

export interface RecipeComponent {
  materialId: string;
  share: number; // 0..1
}

export interface Product {
  id: string;
  name: string;
  weightNetG: number;
  weightGrossG: number;
  cavities: number;
  cycleTimeS: number;
  recipe: RecipeComponent[];
  colorantId: string;
  colorantDosagePct: number;
  machineId: string;
  scrapRatePct: number;
  priceZl: number;
  colors?: string[];
}

export type ShiftLabel = "I" | "II" | "III";

export type WorkMode = "produkcja" | "przezbrojenie" | "przestoj";

export type OrderStatus = "zielony" | "zolty" | "czerwony";

export interface ProductionOrder {
  id: string;
  productId: string;
  orderedQty: number;
  goodQty: number;
  actualCycleTimeS: number;
  actualScrapRatePct: number;
  actualMaterialPriceOverrides?: Record<string, number>;
  setupTimeH: number;
  date: string;
}

export interface CostOverrides {
  cycleTimeS?: number;
  scrapRatePct?: number;
  materialPriceOverrides?: Record<string, number>;
}

export interface DirectCostBreakdown {
  materialCost: number;
  colorantCost: number;
  machineCost: number;
  total: number;
}

export interface ProductEconomics {
  direct: DirectCostBreakdown;
  unitCost: number;
  margin: number;
  markupPct: number;
  hourlyOutput: number;
  marginPerMachineHour: number;
}

export interface WaterfallStep {
  shortLabel: string;
  label: string;
  impact: number;
}

export interface OrderSettlement {
  order: ProductionOrder;
  product: Product;
  calc: ProductEconomics;
  actualDirect: DirectCostBreakdown;
  actualUnitCost: number;
  setupCostPerUnit: number;
  deviationPct: number;
  resultPerUnit: number;
  resultTotal: number;
  status: OrderStatus;
  waterfall: WaterfallStep[];
  suggestedNewPrice: number;
}
