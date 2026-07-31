import { machines, products, productionOrders } from "../lib/seed-data";
import {
  computeProductEconomics,
  computeOrderSettlement,
  formatNumber,
} from "../lib/calculations";
import { costedProductionBatches, LEAD_BATCH_ID } from "../lib/production-batches";
import { computeBatchTKW } from "../lib/tkw";

let failures = 0;

function check(label: string, actual: number, expected: number, tolerance: number) {
  const diff = Math.abs(actual - expected);
  const ok = diff <= tolerance;
  if (!ok) failures++;
  console.log(
    `${ok ? "OK  " : "FAIL"} ${label.padEnd(38)} actual=${actual.toFixed(4).padStart(10)}  expected=${expected
      .toFixed(4)
      .padStart(10)}`
  );
}

function checkRounded(label: string, actual: number, expected: number, decimals: number) {
  const factor = 10 ** decimals;
  check(label, Math.round(actual * factor) / factor, expected, 0);
}

console.log("=== Kontrola produktów (sekcja 4) ===\n");

const expected: Record<string, { cost: number; markup: number; output: number; marginH: number }> = {
  "P-101": { cost: 2.2467, markup: 42.4, output: 75.0, marginH: 71.5 },
  "P-102": { cost: 1.4413, markup: 35.3, output: 189.5, marginH: 96.4 },
  "P-103": { cost: 0.3963, markup: 31.2, output: 654.5, marginH: 81.0 },
  "P-104": { cost: 0.0682, markup: 29.1, output: 5236.4, marginH: 103.8 },
  "P-105": { cost: 0.8406, markup: 36.8, output: 225.0, marginH: 69.6 },
  "P-106": { cost: 4.146, markup: 54.4, output: 50.0, marginH: 112.7 },
};

for (const product of products) {
  const econ = computeProductEconomics(product);
  const exp = expected[product.id];
  console.log(`-- ${product.id} ${product.name}`);
  check("koszt jednostkowy", econ.unitCost, exp.cost, 0.0001);
  check("narzut %", econ.markupPct, exp.markup, 0.05);
  check("wydajność /h", econ.hourlyOutput, exp.output, 0.05);
  check("marża/h", econ.marginPerMachineHour, exp.marginH, 0.05);
  console.log("");
}

console.log("=== Kontrola rozliczeń produkcji rzeczywistej ===\n");

const expectedOrders: Record<
  string,
  { actualCost: number; deviationPct: number; resultPerUnit: number; resultTotal: number }
> = {
  "ZP/2026/218": { actualCost: 1.1783, deviationPct: 40.2, resultPerUnit: -0.0283, resultTotal: -133.56 },
  "ZP/2026/221": { actualCost: 1.6472, deviationPct: 14.3, resultPerUnit: 0.3028, resultTotal: 1467.58 },
  "ZP/2026/224": { actualCost: 0.0775, deviationPct: 13.7, resultPerUnit: 0.0105, resultTotal: 205.72 },
};

for (const order of productionOrders) {
  const settlement = computeOrderSettlement(order);
  const exp = expectedOrders[order.id];
  console.log(`-- ${order.id} (${order.productId})`);
  check("koszt rzeczywisty", settlement.actualUnitCost, exp.actualCost, 0.0001);
  check("odchylenie %", settlement.deviationPct, exp.deviationPct, 0.05);
  check("wynik/szt", settlement.resultPerUnit, exp.resultPerUnit, 0.0001);
  console.log(`     wynik na zleceniu: ${formatNumber(settlement.resultTotal, 2)} zł`);
  console.log("     waterfall:");
  let sum = 0;
  for (const step of settlement.waterfall) {
    sum += step.impact;
    console.log(`       ${step.label.padEnd(55)} ${step.impact >= 0 ? "+" : ""}${formatNumber(step.impact, 4)}`);
  }
  console.log(`       ${"RAZEM".padEnd(55)} ${sum >= 0 ? "+" : ""}${formatNumber(sum, 4)}`);
  check("suma waterfall = koszt rzecz. - koszt kalk.", sum, settlement.actualUnitCost - settlement.calc.unitCost, 0.00001);
  console.log("");
}

console.log("=== Kontrola scenariusza przewodniego P-105 ===\n");

const leadSettlement = computeOrderSettlement(productionOrders.find((o) => o.id === "ZP/2026/218")!);
checkRounded("P-105 koszt kalkulacyjny (4 miejsca)", leadSettlement.calc.unitCost, 0.8406, 4);
checkRounded("P-105 koszt rzeczywisty (4 miejsca)", leadSettlement.actualUnitCost, 1.1783, 4);
checkRounded("P-105 odchylenie kosztu (4 miejsca)", leadSettlement.actualUnitCost - leadSettlement.calc.unitCost, 0.3377, 4);
checkRounded("P-105 odchylenie % (1 miejsce)", leadSettlement.deviationPct, 40.2, 1);
checkRounded("P-105 wynik/szt. (4 miejsca)", leadSettlement.resultPerUnit, -0.0283, 4);
checkRounded("P-105 sugerowana cena (4 miejsca)", leadSettlement.suggestedNewPrice, 1.6119, 4);

const declaredWaterfall = [0.0281, 0.0680, 0.1751, 0.0906];
const declaredWaterfallSum = declaredWaterfall.reduce((sum, value) => sum + value, 0);
console.log("\n=== Kontrola arytmetyki waterfall podanej w specyfikacji ===\n");
console.log(
  `Składowe zadeklarowane: ${declaredWaterfall.map((value) => value.toFixed(4)).join(" + ")} = ${declaredWaterfallSum.toFixed(4)}`
);
console.log("UWAGA: wartości opisowe w promptcie sumują się do 0,3618; aplikacja zachowuje matematycznie domknięty waterfall 0,3377.\n");

console.log("=== Kontrola rozbicia stawki maszynogodziny ===\n");

for (const machine of machines) {
  const parts = machine.machineRateZlH + machine.laborRateZlH + machine.overheadRateZlH;
  check(`${machine.id} suma składników = stawka pełna`, parts, machine.rateZlH, 0.00001);
}

console.log("\n=== Kontrola TKW szarż produkcyjnych ===\n");

for (const batch of costedProductionBatches) {
  const report = computeBatchTKW(batch);
  if (!report) {
    failures++;
    console.log(`FAIL ${batch.id} — brak raportu TKW mimo kompletu parametrów`);
    continue;
  }

  console.log(`-- ${batch.id} (${batch.productId}) · ${report.batch.shiftReportNumber}`);

  // 1. Suma sześciu składników jednostkowych = TKW jednostkowy.
  const plannedSum = report.components.reduce((total, component) => total + component.planned, 0);
  const realizedSum = report.components.reduce((total, component) => total + component.realized, 0);
  check("suma składników = TKW planowany", plannedSum, report.plannedUnitCost, 0.00005);
  check("suma składników = TKW zrealizowany", realizedSum, report.realizedUnitCost, 0.00005);

  // 2. Suma nośników = odchylenie KAŻDEGO składnika (zero reszty, co do grosza).
  report.components.forEach((component, index) => {
    const fromDrivers = report.drivers.reduce((total, driver) => total + driver.perComponent[index]!, 0);
    check(`  nośniki domykają „${component.label}”`, fromDrivers, component.variance, 0.000001);
  });

  // 3. Suma nośników = odchylenie łączne.
  const driversTotal = report.drivers.reduce((total, driver) => total + driver.total, 0);
  check("  nośniki domykają odchylenie łączne", driversTotal, report.variance, 0.000001);

  console.log(
    `     TKW plan ${formatNumber(report.plannedUnitCost, 4)} → real ${formatNumber(
      report.realizedUnitCost, 4
    )} zł/szt. (${report.variance >= 0 ? "+" : ""}${formatNumber(report.variance, 4)} zł, ${
      report.variancePct >= 0 ? "+" : ""
    }${formatNumber(report.variancePct, 1)}%) · status ${report.status}`
  );
  for (const driver of report.drivers) {
    console.log(`       ${driver.label.slice(0, 62).padEnd(64)} ${driver.total >= 0 ? "+" : ""}${formatNumber(driver.total, 4)}`);
  }
  console.log("");
}

console.log("=== Mostek TKW ↔ koszt techniczny modułu 1 (P-105) ===\n");

const leadBatch = costedProductionBatches.find((batch) => batch.id === LEAD_BATCH_ID)!;
const leadReport = computeBatchTKW(leadBatch)!;
const leadPlanned = leadBatch.costParameters!.planned;

// Składniki 1+2+3+6 policzone na parametrach planu BEZ przezbrojenia, formy i
// opakowania muszą odtworzyć koszt jednostkowy z modułu 1 (0,8406 zł).
const bridgeBatch = {
  ...leadBatch,
  moldId: "__brak__",
  costParameters: {
    planned: { ...leadPlanned, setupH: 0, packagingZlPerPiece: 0 },
    realized: { ...leadPlanned, setupH: 0, packagingZlPerPiece: 0, downtimeH: 0, formExtraWearCycles: 0, formServiceCostZl: 0 },
  },
};
const bridge = computeBatchTKW(bridgeBatch)!;
checkRounded("P-105 TKW bez setupu/formy/opakowania = 0,8406", bridge.plannedUnitCost, 0.8406, 4);
checkRounded("P-105 koszt techniczny (mostek do modułu 1)", leadReport.technicalUnitCost, 0.8406, 4);

console.log("\n=== Kontrola wrażliwości: TKW musi reagować na dane z hali ===\n");

const higherScrap = computeBatchTKW(leadBatch, { scrapPct: leadBatch.costParameters!.realized.scrapPct + 5 })!;
const materialUp = higherScrap.components[0]!.realized > leadReport.components[0]!.realized;
const totalUp = higherScrap.realizedUnitCost > leadReport.realizedUnitCost;
if (!materialUp || !totalUp) {
  failures++;
  console.log("FAIL podniesienie brakowości nie podniosło materiałów i TKW");
} else {
  console.log(
    `OK   brakowość +5 p.p. → materiały ${formatNumber(leadReport.components[0]!.realized, 4)} → ${formatNumber(
      higherScrap.components[0]!.realized, 4
    )} zł/szt., TKW ${formatNumber(leadReport.realizedUnitCost, 4)} → ${formatNumber(higherScrap.realizedUnitCost, 4)} zł/szt.`
  );
}

const longerDowntime = computeBatchTKW(leadBatch, { downtimeH: leadBatch.costParameters!.realized.downtimeH + 4 })!;
if (longerDowntime.realizedUnitCost <= leadReport.realizedUnitCost) {
  failures++;
  console.log("FAIL dodatkowy przestój nie podniósł TKW");
} else {
  console.log(
    `OK   przestój +4 h → TKW ${formatNumber(leadReport.realizedUnitCost, 4)} → ${formatNumber(longerDowntime.realizedUnitCost, 4)} zł/szt.`
  );
}

const fasterCycle = computeBatchTKW(leadBatch, { cycleTimeS: leadBatch.costParameters!.realized.cycleTimeS - 7 })!;
if (fasterCycle.realizedUnitCost >= leadReport.realizedUnitCost) {
  failures++;
  console.log("FAIL skrócenie cyklu nie obniżyło TKW");
} else {
  console.log(
    `OK   cykl −7 s → TKW ${formatNumber(leadReport.realizedUnitCost, 4)} → ${formatNumber(fasterCycle.realizedUnitCost, 4)} zł/szt.`
  );
}

console.log("");
console.log(failures === 0 ? `WSZYSTKIE TESTY PRZESZŁY (0 błędów)` : `BŁĘDY: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
