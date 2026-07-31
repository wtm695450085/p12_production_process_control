import type { ProductionBatch, ShiftLabel } from "./types";

/**
 * Szarże z pełnym zestawem parametrów kosztowych — tylko one trafiają do
 * raportu właścicielskiego, bo tylko dla nich kolumnę „zrealizowany" da się
 * uczciwie wyliczyć z danych produkcyjnych. Każda opowiada inną historię, żeby
 * pokazać, że silnik łapie zarówno straty, jak i oszczędności.
 *
 * `SZ/2026/0401` jest szarżą flagową: spięta ze zleceniem ZP/2026/218 i
 * raportem RZ/2026/0431, więc wartości wpisane w panelu operatora realnie
 * przeliczają jej TKW.
 */
export const LEAD_BATCH_ID = "SZ/2026/0401";

const costedBatches: ProductionBatch[] = [
  {
    // Historia: wysoka brakowość + wydłużony cykl + droższy surowiec.
    id: LEAD_BATCH_ID,
    productionOrderId: "ZP/2026/218",
    productId: "P-105",
    startedAt: "2026-06-15T06:00",
    finishedAt: "2026-06-16T05:30",
    shift: "III",
    machineId: "W4",
    moldId: "F-001",
    materialLot: "LOT-105-141",
    colorantLot: "MB-GRN-52",
    operator: "Michał Zieliński",
    setter: "Bartosz Wiśniewski",
    plannedQty: 5000,
    goodQty: 4720,
    badQty: 768,
    actualCycleTimeS: 39,
    status: "zakonczona",
    shiftReportNumber: "RZ/2026/0431",
    setterReportNumber: "RN/2026/0118",
    faultReportNumber: "ZAF/2026/0017",
    purchaseInvoiceNumber: "FZ/2026/0619",
    qualityStatus: "warunkowo",
    costParameters: {
      planned: { qGood: 5000, scrapPct: 3.0, cycleTimeS: 32, setupH: 3.0, packagingZlPerPiece: 0.005 },
      realized: {
        qGood: 4720, scrapPct: 14.0, cycleTimeS: 39, setupH: 4.5, packagingZlPerPiece: 0.005,
        downtimeH: 1.5, downtimeReason: "Zacinanie wypychacza gniazda 2", downtimeReasonEn: "Ejector jamming on cavity 2",
        formExtraWearCycles: 0, formServiceCostZl: 0,
        materialPriceOverrides: { M1: 19.4 },
      },
    },
  },
  {
    // Historia: awaria formy — dodatkowe zużycie, koszt serwisu i postój.
    id: "SZ/2026/0402",
    productionOrderId: "ZP/2026/224",
    productId: "P-104",
    startedAt: "2026-06-29T06:00",
    finishedAt: "2026-06-30T02:10",
    shift: "I",
    machineId: "W3",
    moldId: "F-003",
    materialLot: "LOT-104-133",
    colorantLot: "MB-BLU-47",
    operator: "Anna Nowak",
    setter: "Bartosz Wiśniewski",
    plannedQty: 20000,
    goodQty: 19600,
    badQty: 924,
    actualCycleTimeS: 11,
    status: "zakonczona",
    shiftReportNumber: "RZ/2026/0433",
    setterReportNumber: "RN/2026/0126",
    faultReportNumber: "ZAF/2026/0021",
    moldServiceDocNumber: "PSF/2026/0043",
    qualityStatus: "zwolniona",
    costParameters: {
      planned: { qGood: 20000, scrapPct: 4.0, cycleTimeS: 11, setupH: 2.5, packagingZlPerPiece: 0.002 },
      realized: {
        qGood: 19600, scrapPct: 4.5, cycleTimeS: 11, setupH: 2.5, packagingZlPerPiece: 0.002,
        downtimeH: 3.2, downtimeReason: "Awaria układu wypychania — postój do czasu naprawy", downtimeReasonEn: "Ejection system failure — stopped until repaired",
        formExtraWearCycles: 8000, formServiceCostZl: 420,
      },
    },
  },
  {
    // Historia wzorcowa: realizacja praktycznie zgodna z planem. Dowód, że
    // silnik nie dokłada odchyleń z powietrza.
    id: "SZ/2026/0403",
    productionOrderId: "ZP/2026/229",
    productId: "P-103",
    startedAt: "2026-06-22T14:00",
    finishedAt: "2026-06-23T04:20",
    shift: "II",
    machineId: "W2",
    moldId: "F-003",
    materialLot: "LOT-103-127",
    colorantLot: "MB-RED-44",
    operator: "Zofia Kowalska",
    setter: "Bartosz Wiśniewski",
    plannedQty: 18000,
    goodQty: 17950,
    badQty: 670,
    actualCycleTimeS: 22,
    status: "zakonczona",
    shiftReportNumber: "RZ/2026/0436",
    setterReportNumber: "RN/2026/0131",
    qualityStatus: "zwolniona",
    costParameters: {
      planned: { qGood: 18000, scrapPct: 3.5, cycleTimeS: 22, setupH: 2.0, packagingZlPerPiece: 0.0018 },
      realized: {
        qGood: 17950, scrapPct: 3.6, cycleTimeS: 22, setupH: 2.0, packagingZlPerPiece: 0.0018,
        downtimeH: 0, formExtraWearCycles: 0, formServiceCostZl: 0,
      },
    },
  },
  {
    // Historia: wolniejsza produkcja niż planowano.
    id: "SZ/2026/0404",
    productionOrderId: "ZP/2026/231",
    productId: "P-101",
    startedAt: "2026-07-02T06:00",
    finishedAt: "2026-07-03T12:40",
    shift: "I",
    machineId: "W5",
    moldId: "F-004",
    materialLot: "LOT-101-149",
    colorantLot: "MB-NAT-51",
    operator: "Michał Zieliński",
    setter: "Bartosz Wiśniewski",
    plannedQty: 3200,
    goodQty: 3150,
    badQty: 91,
    actualCycleTimeS: 57,
    status: "zakonczona",
    shiftReportNumber: "RZ/2026/0438",
    setterReportNumber: "RN/2026/0134",
    qualityStatus: "zwolniona",
    costParameters: {
      planned: { qGood: 3200, scrapPct: 2.5, cycleTimeS: 48, setupH: 4.0, packagingZlPerPiece: 0.012 },
      realized: {
        qGood: 3150, scrapPct: 2.8, cycleTimeS: 57, setupH: 4.0, packagingZlPerPiece: 0.012,
        downtimeH: 0.8, downtimeReason: "Regulacja temperatury formy po starcie zmiany", downtimeReasonEn: "Mould temperature adjustment after the shift start",
        formExtraWearCycles: 0, formServiceCostZl: 0,
      },
    },
  },
  {
    // Historia korzystna: mniejszy odpad i krótsze przezbrojenie niż w planie.
    id: "SZ/2026/0405",
    productionOrderId: "ZP/2026/233",
    productId: "P-106",
    startedAt: "2026-07-08T22:00",
    finishedAt: "2026-07-10T09:15",
    shift: "III",
    machineId: "W6",
    moldId: "F-005",
    materialLot: "LOT-106-152",
    colorantLot: "MB-YLW-53",
    operator: "Zofia Kowalska",
    setter: "Bartosz Wiśniewski",
    plannedQty: 2200,
    goodQty: 2260,
    badQty: 27,
    actualCycleTimeS: 70,
    status: "zakonczona",
    shiftReportNumber: "RZ/2026/0440",
    setterReportNumber: "RN/2026/0139",
    qualityStatus: "zwolniona",
    costParameters: {
      planned: { qGood: 2200, scrapPct: 2.0, cycleTimeS: 72, setupH: 5.5, packagingZlPerPiece: 0.02 },
      realized: {
        qGood: 2260, scrapPct: 1.2, cycleTimeS: 70, setupH: 5.0, packagingZlPerPiece: 0.02,
        downtimeH: 0, formExtraWearCycles: 0, formServiceCostZl: 0,
      },
    },
  },
];

const productSetup = [
  { productId:"P-101",machineId:"W5",moldId:"F-004",cycle:48,qty:3200 },
  { productId:"P-102",machineId:"W4",moldId:"F-002",cycle:38,qty:4800 },
  { productId:"P-103",machineId:"W2",moldId:"F-003",cycle:22,qty:18000 },
  { productId:"P-104",machineId:"W3",moldId:"F-003",cycle:11,qty:32000 },
  { productId:"P-105",machineId:"W4",moldId:"F-001",cycle:32,qty:5000 },
  { productId:"P-106",machineId:"W6",moldId:"F-005",cycle:72,qty:2200 },
];
const operators=["Zofia Kowalska","Anna Nowak","Michał Zieliński"];
const setters=["Bartosz Wiśniewski"];
const shifts: ShiftLabel[]=["I","II","III"];

const generatedBatches: ProductionBatch[] = Array.from({length:54},(_,index)=>{
  const setup=productSetup[index%productSetup.length]!;
  const dayOffset=53-index;
  const date=new Date(Date.UTC(2026,4,31+dayOffset,6+(index%3)*8));
  const startedAt=date.toISOString().slice(0,16);
  const isLast=index>=52;
  const status: ProductionBatch["status"]=index===53?"wstrzymana":index===52?"w_realizacji":"zakonczona";
  const qualityStatus: ProductionBatch["qualityStatus"]=status==="zakonczona"?(index%11===0?"warunkowo":"zwolniona"):"oczekuje";
  const scrapPct=1.8+((index*7)%87)/10;
  const plannedQty=setup.qty+((index%3)-1)*Math.round(setup.qty*0.1);
  const processed=isLast?Math.round(plannedQty*(index===52?0.64:0.38)):plannedQty;
  const badQty=Math.round(processed*scrapPct/100);
  const goodQty=processed-badQty;
  const sequence=301+index;
  return {
    id:`SZ/2026/${String(sequence).padStart(4,"0")}`,
    productionOrderId:`ZP/2026/${String(260+Math.floor(index/2)).padStart(3,"0")}`,
    productId:setup.productId,
    startedAt,
    finishedAt:status==="zakonczona"?new Date(date.getTime()+(6+(index%5))*3600000).toISOString().slice(0,16):undefined,
    shift:shifts[index%3]!,
    machineId:setup.machineId,
    moldId:setup.moldId,
    materialLot:`LOT-${setup.productId.slice(-3)}-${String(118+Math.floor(index/4)).padStart(3,"0")}`,
    colorantLot:`MB-${["GRN","RED","BLU","YLW","BLK","NAT"][index%6]}-${String(40+Math.floor(index/6)).padStart(2,"0")}`,
    operator:operators[index%operators.length]!,
    setter:setters[index%setters.length]!,
    plannedQty,
    goodQty,
    badQty,
    actualCycleTimeS:setup.cycle+((index*3)%5)-1,
    status,
    shiftReportNumber:`RZ/2026/${String(510+index).padStart(4,"0")}`,
    qualityStatus,
  };
}).sort((a,b)=>b.startedAt.localeCompare(a.startedAt));

export const productionBatches: ProductionBatch[] = [...costedBatches, ...generatedBatches].sort((a, b) =>
  b.startedAt.localeCompare(a.startedAt)
);

/** Szarże, dla których da się policzyć pełne TKW plan vs realizacja. */
export const costedProductionBatches = productionBatches.filter((batch) => batch.costParameters !== undefined);
