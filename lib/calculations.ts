import { materials, machines, products } from "./seed-data";
import type {
  Product,
  ProductionOrder,
  CostOverrides,
  DirectCostBreakdown,
  ProductEconomics,
  OrderSettlement,
  OrderStatus,
  WaterfallStep,
} from "./types";
import { localeOf, type Lang } from "./i18n";

export function getMaterial(id: string) {
  const m = materials.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown material ${id}`);
  return m;
}

export function getMachine(id: string) {
  const m = machines.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown machine ${id}`);
  return m;
}

export function getProduct(id: string) {
  const p = products.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown product ${id}`);
  return p;
}

export function recipePriceZlKg(
  product: Product,
  materialPriceOverrides?: Record<string, number>
): number {
  return product.recipe.reduce((sum, component) => {
    const material = getMaterial(component.materialId);
    const price = materialPriceOverrides?.[component.materialId] ?? material.priceZlKg;
    return sum + component.share * price;
  }, 0);
}

export function hourlyOutput(product: Product, cycleTimeOverrideS?: number): number {
  const cycleTimeS = cycleTimeOverrideS ?? product.cycleTimeS;
  return (3600 / cycleTimeS) * product.cavities;
}

export function computeDirectCost(
  product: Product,
  overrides: CostOverrides = {}
): DirectCostBreakdown {
  const cycleTimeS = overrides.cycleTimeS ?? product.cycleTimeS;
  const recipePrice = recipePriceZlKg(product, overrides.materialPriceOverrides);
  const materialCost = (product.weightGrossG / 1000) * recipePrice;

  const colorant = getMaterial(product.colorantId);
  const colorantPrice = overrides.materialPriceOverrides?.[colorant.id] ?? colorant.priceZlKg;
  const colorantCost =
    (product.weightGrossG / 1000) * (product.colorantDosagePct / 100) * colorantPrice;

  const machine = getMachine(product.machineId);
  const machineCost = (machine.rateZlH / 3600) * (cycleTimeS / product.cavities);

  return {
    materialCost,
    colorantCost,
    machineCost,
    total: materialCost + colorantCost + machineCost,
  };
}

export function computeUnitCost(product: Product, overrides: CostOverrides = {}): number {
  const direct = computeDirectCost(product, overrides);
  const scrapRatePct = overrides.scrapRatePct ?? product.scrapRatePct;
  return direct.total / (1 - scrapRatePct / 100);
}

export function computeProductEconomics(
  product: Product,
  overrides: CostOverrides = {}
): ProductEconomics {
  const direct = computeDirectCost(product, overrides);
  const unitCost = computeUnitCost(product, overrides);
  const margin = product.priceZl - unitCost;
  const markupPct = (margin / unitCost) * 100;
  const output = hourlyOutput(product, overrides.cycleTimeS);
  const marginPerMachineHour = margin * output;
  return { direct, unitCost, margin, markupPct, hourlyOutput: output, marginPerMachineHour };
}

/** Uniform price change applied to tworzywo-type (plastic) materials only. */
export function applyPlasticPriceChange(pctChange: number): Record<string, number> {
  const overrides: Record<string, number> = {};
  for (const m of materials) {
    if (m.type === "tworzywo") {
      overrides[m.id] = m.priceZlKg * (1 + pctChange / 100);
    }
  }
  return overrides;
}

export type SliderStatus = "zielony" | "zolty" | "czerwony";

export function sliderStatus(pctChange: number): { status: SliderStatus; message: string } {
  if (pctChange <= 10) {
    return { status: "zielony", message: "Kalkulacja aktualna" };
  }
  if (pctChange <= 25) {
    return { status: "zolty", message: "Marża spadła poniżej założonej" };
  }
  return { status: "czerwony", message: "Cena dla Klienta wymaga renegocjacji" };
}

function orderStatus(deviationPct: number, resultPerUnit: number): OrderStatus {
  if (resultPerUnit < 0 || deviationPct > 25) return "czerwony";
  if (deviationPct >= 5) return "zolty";
  return "zielony";
}

export function computeOrderSettlement(order: ProductionOrder): OrderSettlement {
  const product = getProduct(order.productId);
  const machine = getMachine(product.machineId);
  const calc = computeProductEconomics(product);

  const actualOverrides: CostOverrides = {
    cycleTimeS: order.actualCycleTimeS,
    scrapRatePct: order.actualScrapRatePct,
    materialPriceOverrides: order.actualMaterialPriceOverrides,
  };
  const actualDirect = computeDirectCost(product, actualOverrides);
  const preSetupUnitCost = actualDirect.total / (1 - order.actualScrapRatePct / 100);
  const setupCostPerUnit = (order.setupTimeH * machine.rateZlH) / order.goodQty;
  const actualUnitCost = preSetupUnitCost + setupCostPerUnit;

  const deviationPct = ((actualUnitCost - calc.unitCost) / calc.unitCost) * 100;
  const resultPerUnit = product.priceZl - actualUnitCost;
  const resultTotal = resultPerUnit * order.goodQty;
  const status = orderStatus(deviationPct, resultPerUnit);

  // Waterfall decomposition: material and cycle impacts computed as marginal
  // (single-parameter) changes against the calc baseline; setup cost is additive
  // and known directly; scrap absorbs the remaining (interaction) effect so the
  // four steps always sum exactly to the total deviation.
  const waterfall: WaterfallStep[] = [];
  const totalImpact = actualUnitCost - calc.unitCost;

  let materialImpact = 0;
  if (order.actualMaterialPriceOverrides) {
    const materialOnlyCost = computeUnitCost(product, {
      materialPriceOverrides: order.actualMaterialPriceOverrides,
    });
    materialImpact = materialOnlyCost - calc.unitCost;
  }

  let cycleImpact = 0;
  if (order.actualCycleTimeS !== product.cycleTimeS) {
    const cycleOnlyCost = computeUnitCost(product, { cycleTimeS: order.actualCycleTimeS });
    cycleImpact = cycleOnlyCost - calc.unitCost;
  }

  const setupImpact = setupCostPerUnit;
  const scrapImpact = totalImpact - materialImpact - cycleImpact - setupImpact;

  const firstMaterial = product.recipe[0] ? getMaterial(product.recipe[0].materialId) : undefined;
  const overriddenMaterialId = order.actualMaterialPriceOverrides
    ? Object.keys(order.actualMaterialPriceOverrides)[0]
    : undefined;
  const overriddenMaterial = overriddenMaterialId ? getMaterial(overriddenMaterialId) : firstMaterial;

  if (order.actualMaterialPriceOverrides && overriddenMaterial) {
    const newPrice = order.actualMaterialPriceOverrides[overriddenMaterial.id];
    waterfall.push({
      shortLabel: "Cena\ntworzywa",
      label: `Wzrost ceny tworzywa (${formatNumber(overriddenMaterial.priceZlKg, 2)} → ${formatNumber(
        newPrice,
        2
      )} zł/kg)`,
      impact: materialImpact,
    });
  }
  if (order.actualCycleTimeS !== product.cycleTimeS) {
    waterfall.push({
      shortLabel: "Wydłużony\ncykl",
      label: `Wydłużony cykl (${product.cycleTimeS} → ${order.actualCycleTimeS} s)`,
      impact: cycleImpact,
    });
  }
  waterfall.push({
    shortLabel: "Brakowość",
    label: `Wyższa brakowość (${formatNumber(product.scrapRatePct, 1)}% → ${formatNumber(
      order.actualScrapRatePct,
      1
    )}%)`,
    impact: scrapImpact,
  });
  waterfall.push({
    shortLabel: "Przezbrojenie",
    label: `Przezbrojenie nieujęte w kalkulacji (${formatNumber(order.setupTimeH, 1)} h)`,
    impact: setupImpact,
  });

  // The commercial recommendation restores the markup shown to the user
  // (one decimal place), so the displayed percentage and price reconcile
  // exactly when checked with a calculator.
  const displayedMarkupPct = Math.round(calc.markupPct * 10) / 10;
  const suggestedNewPrice = actualUnitCost * (1 + displayedMarkupPct / 100);

  return {
    order,
    product,
    calc,
    actualDirect,
    actualUnitCost,
    setupCostPerUnit,
    deviationPct,
    resultPerUnit,
    resultTotal,
    status,
    waterfall,
    suggestedNewPrice,
  };
}

/**
 * Separator dziesiętny idzie za językiem interfejsu (0,8406 zł wobec
 * 0.8406 zł); walutą pozostaje złoty, bo zakład rozlicza się w PLN.
 */
export function formatNumber(value: number, decimals: number, lang: Lang = "pl"): string {
  return value.toLocaleString(localeOf(lang), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: number, decimals: number, lang: Lang = "pl"): string {
  return `${formatNumber(value, decimals, lang)} zł`;
}

export function formatPercent(value: number, decimals = 1, lang: Lang = "pl"): string {
  return `${formatNumber(value, decimals, lang)}%`;
}
