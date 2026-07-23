import { products, productionOrders } from "../lib/seed-data";
import {
  computeProductEconomics,
  computeOrderSettlement,
  formatNumber,
} from "../lib/calculations";

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

console.log(failures === 0 ? `WSZYSTKIE TESTY PRZESZŁY (0 błędów)` : `BŁĘDY: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
