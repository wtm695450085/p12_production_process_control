import { logisticsCards, technologyCards } from "./seed-data";
import { formatNumber } from "./calculations";
import { pick, type Lang } from "./i18n";
import type { ModuleId, TkwBasis, TkwComponentId, TkwReport } from "./types";

/**
 * Wskazanie dokumentu źródłowego dla konkretnej liczby w raporcie
 * właścicielskim. `moduleId` i `tab` prowadzą do miejsca, w którym ten dokument
 * powstał — dzięki temu każda pozycja TKW da się otworzyć u źródła.
 */
export interface SourceRef {
  /** Numer dokumentu albo nazwa rejestru — to widzi klient. */
  number: string;
  title: string;
  moduleId: ModuleId;
  tab: string;
  /** Rekord do zaznaczenia na liście modułu docelowego, jeśli moduł ją ma. */
  recordId?: string;
}


function shiftReport(report: TkwReport, lang: Lang): SourceRef {
  return {
    number: report.batch.shiftReportNumber,
    title: pick(lang, `Raport zmianowy · zmiana ${report.batch.shift} · ${report.batch.operator}`, `Shift report · shift ${report.batch.shift} · ${report.batch.operator}`),
    moduleId: 3,
    tab: "operator",
  };
}

function setterReport(report: TkwReport, lang: Lang): SourceRef | null {
  if (!report.batch.setterReportNumber) return null;
  return {
    number: report.batch.setterReportNumber,
    title: pick(lang, `Raport nastawiacza · ${report.batch.setter}`, `Setter report · ${report.batch.setter}`),
    moduleId: 3,
    tab: "nastawiacz",
  };
}

function productionOrder(report: TkwReport, lang: Lang): SourceRef {
  return {
    number: report.batch.productionOrderId,
    title: pick(lang, "Zlecenie produkcyjne — ilość zlecona", "Production order — ordered quantity"),
    moduleId: 2,
    tab: "zlecenia",
    recordId: report.batch.productionOrderId,
  };
}

function productCard(report: TkwReport, lang: Lang): SourceRef {
  return {
    number: `KP/${report.product.id}`,
    title: pick(lang, "Karta produktu — waga, receptura, krotność", "Product card — weight, recipe, cavities"),
    moduleId: 1,
    tab: "kartoteka",
  };
}

function calculationSheet(report: TkwReport, lang: Lang): SourceRef {
  return {
    number: `AK/${report.product.id}`,
    title: pick(lang, "Arkusz kalkulacyjny — założenia planu", "Costing sheet — plan assumptions"),
    moduleId: 1,
    tab: "kalkulacja",
    recordId: report.product.id,
  };
}

function machineRates(report: TkwReport, lang: Lang): SourceRef {
  return {
    number: pick(lang, `Stawki ${report.rates.machineId}`, `${report.rates.machineId} rates`),
    title: pick(lang, `${report.rates.machineName} — stawka maszynowa, brygady i narzutu`, `${report.rates.machineName} — machine, crew and overhead rates`),
    moduleId: 1,
    tab: "kartoteka",
  };
}

function technologyCard(report: TkwReport, lang: Lang): SourceRef {
  const card = technologyCards.find((item) => item.productId === report.product.id);
  return {
    number: card ? `${card.id} v${card.versions.at(-1)!.version}` : `KT/${report.product.id}`,
    title: pick(lang, "Karta technologiczna — zatwierdzony czas cyklu", "Process card — approved cycle time"),
    moduleId: 6,
    tab: "karty",
    recordId: card?.id,
  };
}

function logisticsCard(report: TkwReport, lang: Lang): SourceRef {
  const card = logisticsCards.find((item) => item.productId === report.product.id);
  return {
    number: card?.id ?? `KL/${report.product.id}`,
    title: pick(lang, "Karta logistyczna — opakowanie i paletyzacja", "Logistics card — packaging and palletising"),
    moduleId: 7,
    tab: "karty",
    recordId: report.product.id,
  };
}

function moldCard(report: TkwReport, lang: Lang): SourceRef {
  return {
    number: `KF/${report.batch.moldId}/2026`,
    title: pick(lang, "Karta formy — licznik cykli, żywotność i koszt odtworzenia", "Mould card — cycle counter, lifetime and replacement cost"),
    moduleId: 5,
    tab: "formy",
    recordId: report.batch.moldId,
  };
}

function faultReport(report: TkwReport, lang: Lang): SourceRef | null {
  if (!report.batch.faultReportNumber) return null;
  return {
    number: report.batch.faultReportNumber,
    title: pick(lang, "Zgłoszenie awarii formy — przyczyna przestoju", "Mould failure report — cause of downtime"),
    moduleId: 5,
    tab: "awarie",
  };
}

function moldService(report: TkwReport, lang: Lang): SourceRef | null {
  if (!report.batch.moldServiceDocNumber) return null;
  return {
    number: report.batch.moldServiceDocNumber,
    title: pick(lang, "Protokół serwisu formy — koszt naprawy", "Mould service protocol — repair cost"),
    moduleId: 5,
    tab: "serwis",
  };
}

function purchaseInvoice(report: TkwReport, lang: Lang): SourceRef | null {
  if (!report.batch.purchaseInvoiceNumber) return null;
  return {
    number: report.batch.purchaseInvoiceNumber,
    title: pick(lang, "Faktura zakupu — cena materiału, po której liczona jest realizacja", "Purchase invoice — the material price the actuals are computed from"),
    moduleId: 8,
    tab: "faktury",
  };
}

function materialPrices(lang: Lang): SourceRef {
  return {
    number: pick(lang, "Cennik materiałów", "Material price list"),
    title: pick(lang, "Magazyn — obowiązujące ceny zakupowe", "Warehouse — current purchase prices"),
    moduleId: 8,
    tab: "stany",
  };
}

function compact(refs: (SourceRef | null)[]): SourceRef[] {
  return refs.filter((ref): ref is SourceRef => ref !== null);
}

/** Rozpisanie jednego składnika TKW: wzór, działanie po obu stronach i źródła. */
export interface ComponentExplain {
  formula: string;
  planMath: string;
  realizedMath: string;
  note: string;
  planSources: SourceRef[];
  realizedSources: SourceRef[];
}

export function explainComponent(
  report: TkwReport,
  componentId: TkwComponentId,
  lang: Lang = "pl"
): ComponentExplain {
  const { rates, plannedBasis: plan, realizedBasis: real } = report;
  const n = (value: number, decimals: number) => formatNumber(value, decimals, lang);

  switch (componentId) {
    case "materialy":
      return {
        formula: pick(lang, "sztuki przerobione × koszt materiału na sztukę ÷ sztuki dobre", "pieces processed × material cost per piece ÷ good pieces"),
        planMath: materialMath(plan, lang),
        realizedMath: materialMath(real, lang),
        note: `${materialPerPieceNote(report, lang)} ${pick(lang, "Sztuki przerobione = sztuki dobre ÷ (1 − brakowość).", "Pieces processed = good pieces ÷ (1 − scrap rate).")}`,
        planSources: compact([productCard(report, lang), materialPrices(lang), calculationSheet(report, lang)]),
        realizedSources: compact([shiftReport(report, lang), purchaseInvoice(report, lang) ?? materialPrices(lang)]),
      };

    case "robocizna":
      return {
        formula: pick(lang, "godziny zajętości maszyny × stawka brygady ÷ sztuki dobre", "machine occupancy hours × crew rate ÷ good pieces"),
        planMath: hourMath(plan, rates.laborRateZlH, lang),
        realizedMath: hourMath(real, rates.laborRateZlH, lang),
        note: pick(
          lang,
          `Zajętość = ${n(real.shots, 1)} strzałów × ${n(real.cycleTimeS, 0)} s ÷ 3600 = ${n(real.runH, 2)} h pracy + ${n(real.downtimeH, 1)} h przestoju. Stawka brygady ${n(rates.laborRateZlH, 2)} zł/h wg kartoteki ${rates.machineId}.`,
          `Occupancy = ${n(real.shots, 1)} shots × ${n(real.cycleTimeS, 0)} s ÷ 3600 = ${n(real.runH, 2)} h of running + ${n(real.downtimeH, 1)} h of downtime. Crew rate ${n(rates.laborRateZlH, 2)} zł/h per the ${rates.machineId} master data.`
        ),
        planSources: compact([technologyCard(report, lang), machineRates(report, lang)]),
        realizedSources: compact([shiftReport(report, lang), machineRates(report, lang)]),
      };

    case "maszyny":
      return {
        formula: pick(lang, "godziny zajętości maszyny × stawka maszynowa ÷ sztuki dobre", "machine occupancy hours × machine rate ÷ good pieces"),
        planMath: hourMath(plan, rates.machineRateZlH, lang),
        realizedMath: hourMath(real, rates.machineRateZlH, lang),
        note: pick(
          lang,
          `Stawka maszynowa ${rates.machineId} (${rates.machineName}) = ${n(rates.machineRateZlH, 2)} zł/h. Każda godzina przestoju kosztuje tyle samo co godzina pracy.`,
          `Machine rate for ${rates.machineId} (${rates.machineName}) = ${n(rates.machineRateZlH, 2)} zł/h. An hour of downtime costs exactly as much as an hour of running.`
        ),
        planSources: compact([technologyCard(report, lang), machineRates(report, lang)]),
        realizedSources: compact([shiftReport(report, lang), faultReport(report, lang), machineRates(report, lang)]),
      };

    case "przygotowanie":
      return {
        formula: pick(lang, "godziny przezbrojenia × stawka przezbrojenia ÷ sztuki dobre", "changeover hours × changeover rate ÷ good pieces"),
        planMath: pick(
          lang,
          `${n(plan.setupH, 1)} h × ${n(rates.setupRateZlH, 2)} zł/h ÷ ${n(plan.qGood, 0)} szt. dobrych`,
          `${n(plan.setupH, 1)} h × ${n(rates.setupRateZlH, 2)} zł/h ÷ ${n(plan.qGood, 0)} good pieces`
        ),
        realizedMath: pick(
          lang,
          `${n(real.setupH, 1)} h × ${n(rates.setupRateZlH, 2)} zł/h ÷ ${n(real.qGood, 0)} szt. dobrych`,
          `${n(real.setupH, 1)} h × ${n(rates.setupRateZlH, 2)} zł/h ÷ ${n(real.qGood, 0)} good pieces`
        ),
        note: pick(
          lang,
          `Stawka przezbrojenia = maszyna ${n(rates.machineRateZlH, 2)} zł/h + brygada ${n(rates.laborRateZlH, 2)} zł/h. Narzut tych godzin liczony osobno w składniku 6, żeby nie policzyć go dwa razy.`,
          `Changeover rate = machine ${n(rates.machineRateZlH, 2)} zł/h + crew ${n(rates.laborRateZlH, 2)} zł/h. The overhead on those hours is charged separately in component 6 so that it is not counted twice.`
        ),
        planSources: compact([moldCard(report, lang), machineRates(report, lang)]),
        realizedSources: compact([setterReport(report, lang) ?? shiftReport(report, lang), machineRates(report, lang)]),
      };

    case "inne_bezposrednie":
      return {
        formula: pick(lang, "amortyzacja formy + serwis formy + opakowanie ÷ sztuki dobre", "mould depreciation + mould service + packaging ÷ good pieces"),
        planMath: otherMath(plan, report, lang),
        realizedMath: otherMath(real, report, lang),
        note: report.moldDataMissing
          ? pick(
              lang,
              `Forma ${report.batch.moldId} nie ma w karcie kosztu odtworzenia ani żywotności, więc amortyzacja formy nie wchodzi do TKW.`,
              `Mould ${report.batch.moldId} has neither a replacement cost nor a lifetime on its card, so mould depreciation does not enter the manufacturing cost.`
            )
          : pick(
              lang,
              `Amortyzacja formy ${report.batch.moldId} = ${n(rates.moldReplacementCostZl ?? 0, 0)} zł ÷ ${n(rates.moldLifetimeCycles ?? 0, 0)} cykli = ${n(rates.moldCostPerCycleZl, 4)} zł za strzał. Opakowanie ${n(real.packagingZlPerPiece, 4)} zł/szt. wg karty logistycznej.`,
              `Depreciation of mould ${report.batch.moldId} = ${n(rates.moldReplacementCostZl ?? 0, 0)} zł ÷ ${n(rates.moldLifetimeCycles ?? 0, 0)} cycles = ${n(rates.moldCostPerCycleZl, 4)} zł per shot. Packaging ${n(real.packagingZlPerPiece, 4)} zł/pc per the logistics card.`
            ),
        planSources: compact([moldCard(report, lang), logisticsCard(report, lang)]),
        realizedSources: compact([
          moldCard(report, lang),
          moldService(report, lang),
          faultReport(report, lang),
          logisticsCard(report, lang),
        ]),
      };

    case "posrednie":
      return {
        formula: pick(lang, "(godziny zajętości + godziny przezbrojenia) × stawka narzutu ÷ sztuki dobre", "(occupancy hours + changeover hours) × overhead rate ÷ good pieces"),
        planMath: pick(
          lang,
          `(${n(plan.occupiedH, 2)} + ${n(plan.setupH, 1)}) h × ${n(rates.overheadRateZlH, 2)} zł/h ÷ ${n(plan.qGood, 0)} szt. dobrych`,
          `(${n(plan.occupiedH, 2)} + ${n(plan.setupH, 1)}) h × ${n(rates.overheadRateZlH, 2)} zł/h ÷ ${n(plan.qGood, 0)} good pieces`
        ),
        realizedMath: pick(
          lang,
          `(${n(real.occupiedH, 2)} + ${n(real.setupH, 1)}) h × ${n(rates.overheadRateZlH, 2)} zł/h ÷ ${n(real.qGood, 0)} szt. dobrych`,
          `(${n(real.occupiedH, 2)} + ${n(real.setupH, 1)}) h × ${n(rates.overheadRateZlH, 2)} zł/h ÷ ${n(real.qGood, 0)} good pieces`
        ),
        note: pick(
          lang,
          `Stawka narzutu wydziału dla ${rates.machineId} = ${n(rates.overheadRateZlH, 2)} zł/h. To uzasadniona część kosztów pośrednich produkcji przypadająca na godziny tej szarży.`,
          `Department overhead rate for ${rates.machineId} = ${n(rates.overheadRateZlH, 2)} zł/h. This is the justified share of indirect production cost attributable to the hours of this batch.`
        ),
        planSources: compact([machineRates(report, lang), calculationSheet(report, lang)]),
        realizedSources: compact([machineRates(report, lang), shiftReport(report, lang)]),
      };
  }
}

/**
 * Wyprowadzenie kosztu materiału na sztukę. Gdy cena zakupowa się nie zmieniła,
 * pokazuje jedno działanie zamiast dwóch identycznych.
 */
function materialPerPieceNote(report: TkwReport, lang: Lang): string {
  const { rates, plannedBasis: plan, realizedBasis: real } = report;
  const n = (value: number, decimals: number) => formatNumber(value, decimals, lang);
  const head = pick(
    lang,
    `Koszt materiału na sztukę = ${n(rates.grossWeightKg * 1000, 1)} g × (cena receptury + ${n(rates.colorantDosagePct, 1)}% × ${n(real.colorantPriceZlKg, 2)} zł/kg ${rates.colorantSymbol})`,
    `Material cost per piece = ${n(rates.grossWeightKg * 1000, 1)} g × (recipe price + ${n(rates.colorantDosagePct, 1)}% × ${n(real.colorantPriceZlKg, 2)} zł/kg ${rates.colorantSymbol})`
  );

  if (plan.materialPerPieceZl === real.materialPerPieceZl) {
    return pick(
      lang,
      `${head} = ${n(real.recipePriceZlKg, 2)} zł/kg → ${n(real.materialPerPieceZl, 4)} zł/szt.`,
      `${head} = ${n(real.recipePriceZlKg, 2)} zł/kg → ${n(real.materialPerPieceZl, 4)} zł/pc.`
    );
  }
  return pick(
    lang,
    `${head}. Plan przy ${n(plan.recipePriceZlKg, 2)} zł/kg → ${n(plan.materialPerPieceZl, 4)} zł/szt., realizacja przy ${n(real.recipePriceZlKg, 2)} zł/kg → ${n(real.materialPerPieceZl, 4)} zł/szt.`,
    `${head}. Plan at ${n(plan.recipePriceZlKg, 2)} zł/kg → ${n(plan.materialPerPieceZl, 4)} zł/pc, actual at ${n(real.recipePriceZlKg, 2)} zł/kg → ${n(real.materialPerPieceZl, 4)} zł/pc.`
  );
}

function materialMath(basis: TkwBasis, lang: Lang): string {
  const n = (value: number, decimals: number) => formatNumber(value, decimals, lang);
  return pick(
    lang,
    `${n(basis.totalPieces, 1)} szt. przerobionych × ${n(basis.materialPerPieceZl, 4)} zł ÷ ${n(basis.qGood, 0)} szt. dobrych`,
    `${n(basis.totalPieces, 1)} pieces processed × ${n(basis.materialPerPieceZl, 4)} zł ÷ ${n(basis.qGood, 0)} good pieces`
  );
}

function hourMath(basis: TkwBasis, rateZlH: number, lang: Lang): string {
  const n = (value: number, decimals: number) => formatNumber(value, decimals, lang);
  return pick(
    lang,
    `${n(basis.occupiedH, 2)} h × ${n(rateZlH, 2)} zł/h ÷ ${n(basis.qGood, 0)} szt. dobrych`,
    `${n(basis.occupiedH, 2)} h × ${n(rateZlH, 2)} zł/h ÷ ${n(basis.qGood, 0)} good pieces`
  );
}

function otherMath(basis: TkwBasis, report: TkwReport, lang: Lang): string {
  const n = (value: number, decimals: number) => formatNumber(value, decimals, lang);
  const parts = [
    pick(
      lang,
      `${n(basis.shots + basis.formExtraWearCycles, 1)} cykli × ${n(report.rates.moldCostPerCycleZl, 4)} zł`,
      `${n(basis.shots + basis.formExtraWearCycles, 1)} cycles × ${n(report.rates.moldCostPerCycleZl, 4)} zł`
    ),
  ];
  if (basis.formServiceCostZl > 0)
    parts.push(pick(lang, `${n(basis.formServiceCostZl, 0)} zł serwisu`, `${n(basis.formServiceCostZl, 0)} zł service`));
  parts.push(
    pick(
      lang,
      `${n(basis.totalPieces, 1)} szt. × ${n(basis.packagingZlPerPiece, 4)} zł opakowania`,
      `${n(basis.totalPieces, 1)} pcs × ${n(basis.packagingZlPerPiece, 4)} zł packaging`
    )
  );
  return pick(
    lang,
    `(${parts.join(" + ")}) ÷ ${n(basis.qGood, 0)} szt. dobrych`,
    `(${parts.join(" + ")}) ÷ ${n(basis.qGood, 0)} good pieces`
  );
}

/** Dokumenty, z których pochodzi nośnik odchylenia. */
export function driverSources(report: TkwReport, driverId: string, lang: Lang = "pl"): SourceRef[] {
  switch (driverId) {
    case "cena_materialu":
      return compact([purchaseInvoice(report, lang) ?? materialPrices(lang)]);
    case "brakowosc":
    case "cykl":
      return compact([shiftReport(report, lang)]);
    case "przestoj":
      return compact([shiftReport(report, lang), faultReport(report, lang)]);
    case "przezbrojenie":
      return compact([setterReport(report, lang) ?? shiftReport(report, lang)]);
    case "forma":
      return compact([moldService(report, lang), moldCard(report, lang)]);
    case "opakowanie":
      return compact([logisticsCard(report, lang)]);
    case "wolumen":
      return compact([productionOrder(report, lang), shiftReport(report, lang)]);
    default:
      return compact([shiftReport(report, lang)]);
  }
}

/** Wiersz tabeli parametrów wejściowych: plan, realizacja i skąd każde pochodzi. */
export interface ParameterRow {
  label: string;
  plan: string;
  realized: string;
  changed: boolean;
  planSource: SourceRef;
  realizedSource: SourceRef;
  comment?: string;
}

export function parameterRows(report: TkwReport, lang: Lang = "pl"): ParameterRow[] {
  const { plannedBasis: plan, realizedBasis: real, rates } = report;
  const n = (value: number, decimals: number) => formatNumber(value, decimals, lang);
  const rz = shiftReport(report, lang);
  const rows: ParameterRow[] = [
    {
      label: pick(lang, "Sztuki dobre", "Good pieces"),
      plan: `${n(plan.qGood, 0)} ${pick(lang, "szt.", "pcs")}`,
      realized: `${n(real.qGood, 0)} ${pick(lang, "szt.", "pcs")}`,
      changed: plan.qGood !== real.qGood,
      planSource: productionOrder(report, lang),
      realizedSource: rz,
    },
    {
      label: pick(lang, "Brakowość", "Scrap rate"),
      plan: `${n(plan.scrapPct, 1)}%`,
      realized: `${n(real.scrapPct, 1)}%`,
      changed: plan.scrapPct !== real.scrapPct,
      planSource: calculationSheet(report, lang),
      realizedSource: rz,
      comment: pick(
        lang,
        `Zmienia liczbę sztuk przerobionych z ${n(plan.totalPieces, 1)} na ${n(real.totalPieces, 1)} — tyle maszyna musi wyprodukować, żeby powstały sztuki dobre.`,
        `Moves the number of pieces processed from ${n(plan.totalPieces, 1)} to ${n(real.totalPieces, 1)} — that is how many the machine must produce to end up with good pieces.`
      ),
    },
    {
      label: pick(lang, "Czas cyklu", "Cycle time"),
      plan: `${n(plan.cycleTimeS, 0)} s`,
      realized: `${n(real.cycleTimeS, 0)} s`,
      changed: plan.cycleTimeS !== real.cycleTimeS,
      planSource: technologyCard(report, lang),
      realizedSource: rz,
      comment: pick(
        lang,
        `Przy krotności ${n(rates.cavities, 0)} daje ${n(real.runH, 2)} h pracy maszyny.`,
        `With ${n(rates.cavities, 0)} cavities this gives ${n(real.runH, 2)} h of machine running time.`
      ),
    },
    {
      label: pick(lang, "Przestój", "Downtime"),
      plan: `${n(plan.downtimeH, 1)} h`,
      realized: `${n(real.downtimeH, 1)} h`,
      changed: plan.downtimeH !== real.downtimeH,
      planSource: calculationSheet(report, lang),
      realizedSource: faultReport(report, lang) ?? rz,
      comment: pick(
        lang,
        report.batch.costParameters?.realized.downtimeReason ?? "",
        report.batch.costParameters?.realized.downtimeReasonEn ??
          report.batch.costParameters?.realized.downtimeReason ??
          ""
      ) || undefined,
    },
    {
      label: pick(lang, "Przezbrojenie", "Changeover"),
      plan: `${n(plan.setupH, 1)} h`,
      realized: `${n(real.setupH, 1)} h`,
      changed: plan.setupH !== real.setupH,
      planSource: moldCard(report, lang),
      realizedSource: setterReport(report, lang) ?? rz,
    },
    {
      label: pick(lang, "Cena receptury", "Recipe price"),
      plan: `${n(plan.recipePriceZlKg, 2)} zł/kg`,
      realized: `${n(real.recipePriceZlKg, 2)} zł/kg`,
      changed: plan.recipePriceZlKg !== real.recipePriceZlKg,
      planSource: materialPrices(lang),
      realizedSource: purchaseInvoice(report, lang) ?? materialPrices(lang),
    },
    {
      label: pick(lang, "Opakowanie", "Packaging"),
      plan: `${n(plan.packagingZlPerPiece, 4)} zł/szt.`,
      realized: `${n(real.packagingZlPerPiece, 4)} zł/szt.`,
      changed: plan.packagingZlPerPiece !== real.packagingZlPerPiece,
      planSource: logisticsCard(report, lang),
      realizedSource: logisticsCard(report, lang),
    },
    {
      label: pick(lang, `Stawki ${rates.machineId}`, `${rates.machineId} rates`),
      plan: `${n(rates.machineRateZlH, 0)} / ${n(rates.laborRateZlH, 0)} / ${n(
        rates.overheadRateZlH,
        0
      )} zł/h`,
      realized: `${n(rates.machineRateZlH, 0)} / ${n(rates.laborRateZlH, 0)} / ${n(
        rates.overheadRateZlH,
        0
      )} zł/h`,
      changed: false,
      planSource: machineRates(report, lang),
      realizedSource: machineRates(report, lang),
      comment: pick(
        lang,
        "Maszyna / brygada / narzut wydziału — te same stawki po obu stronach.",
        "Machine / crew / department overhead — the same rates on both sides."
      ),
    },
  ];

  if (!report.moldDataMissing) {
    rows.push({
      label: pick(lang, "Amortyzacja formy", "Mould depreciation"),
      plan: `${n(rates.moldCostPerCycleZl, 4)} zł/cykl`,
      realized: `${n(rates.moldCostPerCycleZl, 4)} zł/cykl`,
      // Stawka jest ta sama po obu stronach — czerwony byłby mylący; dodatkowe
      // zużycie i serwis wchodzą do składnika 5 i są opisane w komentarzu.
      changed: false,
      planSource: moldCard(report, lang),
      realizedSource: moldService(report, lang) ?? moldCard(report, lang),
      comment:
        real.formExtraWearCycles > 0 || real.formServiceCostZl > 0
          ? pick(
              lang,
              `Doliczono ${n(real.formExtraWearCycles, 0)} cykli zużycia i ${n(real.formServiceCostZl, 0)} zł serwisu.`,
              `Charged ${n(real.formExtraWearCycles, 0)} cycles of wear and ${n(real.formServiceCostZl, 0)} zł of service.`
            )
          : undefined,
    });
  }

  return rows;
}
