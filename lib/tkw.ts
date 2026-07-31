import { molds } from "./seed-data";
import {
  formatNumber,
  getMachine,
  getProduct,
  recipePriceZlKg,
  getMaterial,
  computeUnitCost,
} from "./calculations";
import type {
  BatchCostParameters,
  BatchPlannedCost,
  BatchRealizedCost,
  OrderStatus,
  Product,
  ProductionBatch,
  TkwBasis,
  TkwComponent,
  TkwComponentId,
  TkwDriver,
  TkwRates,
  TkwReport,
} from "./types";
import { pick, type Lang } from "./i18n";

/**
 * TKW = materiały bezpośrednie + robocizna bezpośrednia + koszt maszyn
 *     + przygotowanie produkcji + inne koszty bezpośrednie
 *     + uzasadniona część kosztów pośrednich produkcji.
 *
 * Wszystko liczone na JEDNĄ SZTUKĘ DOBRĄ. Kolejność jest stała — indeks w tej
 * tablicy jest jednocześnie indeksem w `TkwDriver.perComponent`.
 */
const COMPONENTS: { id: TkwComponentId; label: string; labelEn: string }[] = [
  { id: "materialy", label: "Materiały bezpośrednie", labelEn: "Direct materials" },
  { id: "robocizna", label: "Robocizna bezpośrednia", labelEn: "Direct labour" },
  { id: "maszyny", label: "Koszt maszyn", labelEn: "Machine cost" },
  { id: "przygotowanie", label: "Przygotowanie produkcji", labelEn: "Production setup" },
  { id: "inne_bezposrednie", label: "Inne koszty bezpośrednie", labelEn: "Other direct costs" },
  { id: "posrednie", label: "Koszty pośrednie produkcji", labelEn: "Indirect production cost" },
];

export const tkwComponentLabels = COMPONENTS;

/**
 * Pełny wektor wejściowy modelu kosztowego. Każde pole jest nośnikiem, którym
 * można poruszyć niezależnie — na tym opiera się rozkład odchylenia.
 */
interface CostVector {
  qGood: number;
  scrapPct: number;
  cycleTimeS: number;
  setupH: number;
  downtimeH: number;
  packagingZlPerPiece: number;
  formExtraWearCycles: number;
  formServiceCostZl: number;
  materialPriceOverrides?: Record<string, number>;
}

interface CostContext {
  product: Product;
  machineId: string;
  machineName: string;
  colorantSymbol: string;
  moldReplacementCostZl?: number;
  moldLifetimeCycles?: number;
  cavities: number;
  grossWeightKg: number;
  colorantDosagePct: number;
  colorantId: string;
  machineRateZlH: number;
  laborRateZlH: number;
  overheadRateZlH: number;
  setupRateZlH: number;
  /** zł na jeden strzał; 0 gdy forma nie ma danych ekonomicznych. */
  moldCostPerCycleZl: number;
}

/**
 * Wielkości pośrednie wektora: ile sztuk faktycznie trzeba przerobić, ile to
 * strzałów, godzin i złotych materiału na sztukę. Wydzielone z
 * `componentsFor`, bo raport właścicielski pokazuje te same liczby w opisie
 * działania przy każdym składniku.
 */
function basisFor(context: CostContext, vector: CostVector): TkwBasis {
  const { product } = context;

  // Sztuki wyprodukowane łącznie: żeby dostać `qGood` sztuk dobrych przy
  // brakowości `scrapPct`, maszyna musi przerobić odpowiednio więcej.
  const totalPieces = vector.qGood / (1 - vector.scrapPct / 100);
  const shots = totalPieces / context.cavities;
  const runH = (shots * vector.cycleTimeS) / 3600;

  const recipePrice = recipePriceZlKg(product, vector.materialPriceOverrides);
  const colorant = getMaterial(context.colorantId);
  const colorantPrice = vector.materialPriceOverrides?.[colorant.id] ?? colorant.priceZlKg;

  return {
    qGood: vector.qGood,
    scrapPct: vector.scrapPct,
    totalPieces,
    shots,
    cycleTimeS: vector.cycleTimeS,
    runH,
    downtimeH: vector.downtimeH,
    occupiedH: runH + vector.downtimeH,
    setupH: vector.setupH,
    recipePriceZlKg: recipePrice,
    colorantPriceZlKg: colorantPrice,
    materialPerPieceZl:
      context.grossWeightKg * (recipePrice + (context.colorantDosagePct / 100) * colorantPrice),
    packagingZlPerPiece: vector.packagingZlPerPiece,
    formExtraWearCycles: vector.formExtraWearCycles,
    formServiceCostZl: vector.formServiceCostZl,
  };
}

/**
 * Jednostkowe koszty sześciu składników dla zadanego wektora wejściowego.
 * Zwraca zł/szt. dobrą, w kolejności `COMPONENTS`.
 */
function componentsFor(context: CostContext, vector: CostVector): number[] {
  const basis = basisFor(context, vector);

  const materials = basis.totalPieces * basis.materialPerPieceZl;
  const labour = basis.occupiedH * context.laborRateZlH;
  const machine = basis.occupiedH * context.machineRateZlH;
  const setup = basis.setupH * context.setupRateZlH;
  const other =
    (basis.shots + basis.formExtraWearCycles) * context.moldCostPerCycleZl +
    basis.formServiceCostZl +
    basis.totalPieces * basis.packagingZlPerPiece;
  const overhead = (basis.occupiedH + basis.setupH) * context.overheadRateZlH;

  return [materials, labour, machine, setup, other, overhead].map((total) => total / basis.qGood);
}

function buildContext(batch: ProductionBatch, product: Product): CostContext {
  const machine = getMachine(batch.machineId);
  const mold = molds.find((m) => m.id === batch.moldId);
  const hasMoldEconomics =
    mold?.replacementCostZl !== undefined && mold?.lifetimeCycles !== undefined && mold.lifetimeCycles > 0;

  return {
    product,
    machineId: machine.id,
    machineName: machine.name,
    colorantSymbol: getMaterial(product.colorantId).symbol,
    moldReplacementCostZl: hasMoldEconomics ? mold!.replacementCostZl : undefined,
    moldLifetimeCycles: hasMoldEconomics ? mold!.lifetimeCycles : undefined,
    cavities: product.cavities,
    grossWeightKg: product.weightGrossG / 1000,
    colorantDosagePct: product.colorantDosagePct,
    colorantId: product.colorantId,
    machineRateZlH: machine.machineRateZlH,
    laborRateZlH: machine.laborRateZlH,
    overheadRateZlH: machine.overheadRateZlH,
    // Przy przezbrojeniu pracuje maszyna i brygada; koszty pośrednie tych godzin
    // wchodzą osobno do składnika 6, żeby nie liczyć ich dwa razy.
    setupRateZlH: machine.machineRateZlH + machine.laborRateZlH,
    moldCostPerCycleZl: hasMoldEconomics ? mold!.replacementCostZl! / mold!.lifetimeCycles! : 0,
  };
}

function plannedVector(planned: BatchPlannedCost): CostVector {
  return {
    qGood: planned.qGood,
    scrapPct: planned.scrapPct,
    cycleTimeS: planned.cycleTimeS,
    setupH: planned.setupH,
    packagingZlPerPiece: planned.packagingZlPerPiece,
    // Plan z definicji nie zakłada przestoju ani awarii formy.
    downtimeH: 0,
    formExtraWearCycles: 0,
    formServiceCostZl: 0,
  };
}

function realizedVector(realized: BatchRealizedCost): CostVector {
  return {
    qGood: realized.qGood,
    scrapPct: realized.scrapPct,
    cycleTimeS: realized.cycleTimeS,
    setupH: realized.setupH,
    packagingZlPerPiece: realized.packagingZlPerPiece,
    downtimeH: realized.downtimeH,
    formExtraWearCycles: realized.formExtraWearCycles,
    formServiceCostZl: realized.formServiceCostZl,
    materialPriceOverrides: realized.materialPriceOverrides,
  };
}

function subtract(after: number[], before: number[]): number[] {
  return after.map((value, index) => value - before[index]!);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function priceChangeLabel(
  planned: BatchPlannedCost,
  realized: BatchRealizedCost,
  product: Product,
  lang: Lang
): string {
  const overrides = realized.materialPriceOverrides ?? {};
  const [materialId] = Object.keys(overrides);
  if (!materialId) return pick(lang, "Cena materiału", "Material price");
  const material = getMaterial(materialId);
  void planned;
  void product;
  const from = formatNumber(material.priceZlKg, 2, lang);
  const to = formatNumber(overrides[materialId]!, 2, lang);
  return pick(
    lang,
    `Cena materiału ${material.symbol} ${from} → ${to} zł/kg`,
    `Material price ${material.symbol} ${from} → ${to} zł/kg`
  );
}

/**
 * Rozkład odchylenia metodą SEKWENCYJNEJ SUBSTYTUCJI.
 *
 * Startujemy od wektora w pełni planowanego i zmieniamy dokładnie jeden nośnik
 * naraz, zapisując przyrost każdego z sześciu składników. Po przejściu całej
 * listy wektor jest w pełni zrealizowany, więc suma przyrostów równa się
 * odchyleniu **z definicji, bez wartości domykającej** — inaczej niż
 * historyczny waterfall w `computeOrderSettlement`, gdzie brakowość pochłania
 * resztę. Kolejność nośników jest stała i udokumentowana, bo przy substytucji
 * sekwencyjnej wpływa na podział efektów interakcji.
 */
function decompose(
  context: CostContext,
  planned: BatchPlannedCost,
  realized: BatchRealizedCost,
  product: Product,
  lang: Lang
): TkwDriver[] {
  const n = (value: number, decimals: number) => formatNumber(value, decimals, lang);
  const steps: { id: string; label: string; apply: (vector: CostVector) => CostVector }[] = [
    {
      id: "cena_materialu",
      label: priceChangeLabel(planned, realized, product, lang),
      apply: (v) => ({ ...v, materialPriceOverrides: realized.materialPriceOverrides }),
    },
    {
      id: "brakowosc",
      label: pick(
        lang,
        `Brakowość ${n(planned.scrapPct, 1)}% → ${n(realized.scrapPct, 1)}%`,
        `Scrap rate ${n(planned.scrapPct, 1)}% → ${n(realized.scrapPct, 1)}%`
      ),
      apply: (v) => ({ ...v, scrapPct: realized.scrapPct }),
    },
    {
      id: "cykl",
      label: pick(
        lang,
        `Czas cyklu ${n(planned.cycleTimeS, 0)} → ${n(realized.cycleTimeS, 0)} s`,
        `Cycle time ${n(planned.cycleTimeS, 0)} → ${n(realized.cycleTimeS, 0)} s`
      ),
      apply: (v) => ({ ...v, cycleTimeS: realized.cycleTimeS }),
    },
    {
      id: "przestoj",
      label: realized.downtimeReason
        ? pick(
            lang,
            `Przestój ${n(realized.downtimeH, 1)} h — ${realized.downtimeReason}`,
            `Downtime ${n(realized.downtimeH, 1)} h — ${realized.downtimeReasonEn ?? realized.downtimeReason}`
          )
        : pick(lang, `Przestój ${n(realized.downtimeH, 1)} h`, `Downtime ${n(realized.downtimeH, 1)} h`),
      apply: (v) => ({ ...v, downtimeH: realized.downtimeH }),
    },
    {
      id: "przezbrojenie",
      label: pick(
        lang,
        `Przezbrojenie ${n(planned.setupH, 1)} → ${n(realized.setupH, 1)} h`,
        `Changeover ${n(planned.setupH, 1)} → ${n(realized.setupH, 1)} h`
      ),
      apply: (v) => ({ ...v, setupH: realized.setupH }),
    },
    {
      id: "forma",
      label:
        realized.formServiceCostZl > 0
          ? pick(
              lang,
              `Awaria formy — serwis ${n(realized.formServiceCostZl, 0)} zł i ${n(realized.formExtraWearCycles, 0)} cykli zużycia`,
              `Mould failure — service ${n(realized.formServiceCostZl, 0)} zł and ${n(realized.formExtraWearCycles, 0)} cycles of wear`
            )
          : pick(
              lang,
              `Zużycie formy ${n(realized.formExtraWearCycles, 0)} cykli`,
              `Mould wear ${n(realized.formExtraWearCycles, 0)} cycles`
            ),
      apply: (v) => ({
        ...v,
        formExtraWearCycles: realized.formExtraWearCycles,
        formServiceCostZl: realized.formServiceCostZl,
      }),
    },
    {
      id: "opakowanie",
      label: pick(
        lang,
        `Opakowanie ${n(planned.packagingZlPerPiece, 4)} → ${n(realized.packagingZlPerPiece, 4)} zł/szt.`,
        `Packaging ${n(planned.packagingZlPerPiece, 4)} → ${n(realized.packagingZlPerPiece, 4)} zł/pc`
      ),
      apply: (v) => ({ ...v, packagingZlPerPiece: realized.packagingZlPerPiece }),
    },
    {
      id: "wolumen",
      label: pick(
        lang,
        `Wolumen ${n(planned.qGood, 0)} → ${n(realized.qGood, 0)} szt. dobrych`,
        `Volume ${n(planned.qGood, 0)} → ${n(realized.qGood, 0)} good pieces`
      ),
      apply: (v) => ({ ...v, qGood: realized.qGood }),
    },
  ];

  const drivers: TkwDriver[] = [];
  let vector = plannedVector(planned);
  let current = componentsFor(context, vector);

  for (const step of steps) {
    const nextVector = step.apply(vector);
    const next = componentsFor(context, nextVector);
    const perComponent = subtract(next, current);
    const total = sum(perComponent);
    // Nośniki bez wpływu (parametr się nie zmienił) nie zaśmiecają raportu,
    // ale nadal przechodzą przez wektor, więc domknięcie sumy jest zachowane.
    if (Math.abs(total) > 1e-12) {
      drivers.push({ id: step.id, label: step.label, perComponent, total });
    }
    vector = nextVector;
    current = next;
  }

  return drivers;
}

function batchStatus(variancePct: number, marginPerUnit: number): OrderStatus {
  if (marginPerUnit < 0 || variancePct > 25) return "czerwony";
  if (variancePct >= 5) return "zolty";
  return "zielony";
}

/**
 * Raport TKW pojedynczej szarży: plan vs realizacja w rozbiciu na sześć
 * składników, z rozkładem odchylenia na nośniki.
 *
 * Zwraca `null` dla szarż bez kompletu parametrów kosztowych — raport
 * właścicielski woli pokazać brak danych niż zmyśloną kolumnę „zrealizowany".
 */
export function computeBatchTKW(
  batch: ProductionBatch,
  overrides?: Partial<BatchRealizedCost>,
  lang: Lang = "pl"
): TkwReport | null {
  if (!batch.costParameters) return null;

  const product = getProduct(batch.productId);
  const context = buildContext(batch, product);
  const parameters: BatchCostParameters = {
    planned: batch.costParameters.planned,
    realized: { ...batch.costParameters.realized, ...overrides },
  };

  const plannedInput = plannedVector(parameters.planned);
  const realizedInput = realizedVector(parameters.realized);
  const plannedUnits = componentsFor(context, plannedInput);
  const realizedUnits = componentsFor(context, realizedInput);
  const drivers = decompose(context, parameters.planned, parameters.realized, product, lang);

  const components: TkwComponent[] = COMPONENTS.map((component, index) => {
    const planned = plannedUnits[index]!;
    const realized = realizedUnits[index]!;
    return {
      id: component.id,
      label: pick(lang, component.label, component.labelEn),
      planned,
      realized,
      variance: realized - planned,
      variancePct: planned !== 0 ? ((realized - planned) / planned) * 100 : null,
    };
  });

  const plannedUnitCost = sum(plannedUnits);
  const realizedUnitCost = sum(realizedUnits);
  const variance = realizedUnitCost - plannedUnitCost;

  const rates: TkwRates = {
    machineId: context.machineId,
    machineName: context.machineName,
    cavities: context.cavities,
    grossWeightKg: context.grossWeightKg,
    colorantDosagePct: context.colorantDosagePct,
    colorantSymbol: context.colorantSymbol,
    machineRateZlH: context.machineRateZlH,
    laborRateZlH: context.laborRateZlH,
    overheadRateZlH: context.overheadRateZlH,
    setupRateZlH: context.setupRateZlH,
    moldCostPerCycleZl: context.moldCostPerCycleZl,
    moldReplacementCostZl: context.moldReplacementCostZl,
    moldLifetimeCycles: context.moldLifetimeCycles,
  };

  return {
    batch,
    product,
    components,
    drivers,
    plannedBasis: basisFor(context, plannedInput),
    realizedBasis: basisFor(context, realizedInput),
    rates,
    plannedUnitCost,
    realizedUnitCost,
    variance,
    variancePct: (variance / plannedUnitCost) * 100,
    status: batchStatus((variance / plannedUnitCost) * 100, product.priceZl - realizedUnitCost),
    // Mostek do modułu 1: koszt techniczny bez przygotowania produkcji,
    // amortyzacji formy i opakowania (dla P-105 = 0,8406 zł).
    technicalUnitCost: computeUnitCost(product),
    moldDataMissing: context.moldCostPerCycleZl === 0,
  };
}

/**
 * Zdanie otwierające raport, budowane z dwóch najmocniejszych nośników —
 * nie z szablonu, więc zmienia się razem z danymi.
 */
export function describeVariance(report: TkwReport, lang: Lang = "pl"): string {
  const { variance, drivers, batch } = report;
  if (Math.abs(variance) < 0.0005) {
    return pick(
      lang,
      `Szarża ${batch.id} wyszła zgodnie z założeniami — odchylenie kosztu jednostkowego jest pomijalne.`,
      `Batch ${batch.id} came out as assumed — the unit cost variance is negligible.`
    );
  }

  const ranked = [...drivers].sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  const leading = ranked.filter((driver) => Math.sign(driver.total) === Math.sign(variance)).slice(0, 2);
  const amount = formatNumber(Math.abs(variance), 4, lang);

  const reasons = leading
    .map(
      (driver) =>
        `${driver.label.toLowerCase()} (${driver.total > 0 ? "+" : "−"}${formatNumber(
          Math.abs(driver.total),
          4,
          lang
        )} zł)`
    )
    .join(pick(lang, " oraz ", " and "));

  const opening = pick(
    lang,
    `Ta szarża wyszła o ${amount} zł/szt. ${variance > 0 ? "drożej" : "taniej"} niż zakładano`,
    `This batch came out ${amount} zł/pc ${variance > 0 ? "more expensive" : "cheaper"} than assumed`
  );
  return reasons ? `${opening} — ${pick(lang, "głównie", "mainly")} ${reasons}.` : `${opening}.`;
}
