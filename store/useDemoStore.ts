import { create } from "zustand";
import { operators, productionOrders } from "@/lib/seed-data";
import type { WorkMode } from "@/lib/types";
import type { ModuleId } from "@/lib/types";
import type { Lang } from "@/lib/i18n";

export type ScreenId = 1 | 2 | 3 | 4 | 5;
export type AppModuleId = 0 | ModuleId | 10;

interface ColorCount {
  good: number;
  bad: number;
}

interface ShiftForm {
  operator: string;
  shift: "I" | "II" | "III";
  colorCounts: Record<string, ColorCount>;
  singleCount: ColorCount;
  cycleTimeInput: number;
  workMode: WorkMode;
  setupHours: number;
  notes: string;
}

interface ProgressState {
  producedGood: number;
  producedBad: number;
}

function initialShiftForm(cycleTimeS: number, colors?: string[]): ShiftForm {
  const colorCounts: Record<string, ColorCount> = {};
  if (colors) {
    for (const c of colors) colorCounts[c] = { good: 0, bad: 0 };
  }
  return {
    operator: operators[0],
    shift: "I",
    colorCounts,
    singleCount: { good: 0, bad: 0 },
    cycleTimeInput: cycleTimeS,
    workMode: "produkcja",
    setupHours: 0,
    notes: "",
  };
}

// Illustrative "in progress" starting point for the shift-floor screen, so the
// demo never opens on an empty state. Independent of the sealed settlement
// figures on Ekran 4 (those are fixed seed data, not derived from this).
const initialProgress: Record<string, ProgressState> = {
  "ZP/2026/218": { producedGood: 2860, producedBad: 466 },
  "ZP/2026/221": { producedGood: 3400, producedBad: 276 },
  "ZP/2026/224": { producedGood: 14200, producedBad: 668 },
};

interface DemoState {
  currentScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
  currentModule: AppModuleId;
  setModule: (module: AppModuleId) => void;
  activeUserId: string;
  setActiveUser: (userId: string) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  moduleTabs: Partial<Record<ModuleId, string>>;
  setModuleTab: (module: ModuleId, tab: string) => void;
  /**
   * Rekord wybrany na liście danego modułu (forma, karta technologiczna,
   * karta logistyczna, zlecenie). Trzymany w store, żeby raport właścicielski
   * mógł otworzyć dokładnie ten dokument, z którego pochodzi liczba.
   */
  recordFocus: Partial<Record<ModuleId, string>>;
  setRecordFocus: (module: ModuleId, recordId: string) => void;
  mapFocus: ModuleId | null;
  setMapFocus: (module: ModuleId | null) => void;
  inboxCounts: Partial<Record<ModuleId, number>>;
  inboxMessages: Partial<Record<ModuleId, string[]>>;
  acknowledgeInbox: (module: ModuleId) => void;
  routeConfirmation: { documentNumber: string; targets: ModuleId[] } | null;
  closeRouteConfirmation: () => void;
  p105CalculationStale: boolean;
  purchasePriceApplied: boolean;
  moldF001InService: boolean;
  technologyNotes: string[];
  planSetupHours: number;
  materialConsumedKg: number;
  submitLeadShiftReport: () => void;
  finalizeCostSettlement: () => void;
  applyPurchaseInvoice: () => void;

  selectedProductId: string;
  setSelectedProduct: (id: string) => void;

  plasticPriceChangePct: number;
  setPlasticPriceChangePct: (pct: number) => void;
  applyToAllProducts: boolean;
  setApplyToAllProducts: (v: boolean) => void;

  selectedOrderId: string;
  setSelectedOrder: (id: string) => void;
  suggestedPriceRevealed: Record<string, boolean>;
  revealSuggestedPrice: (orderId: string) => void;

  activeReportOrderId: string;
  setActiveReportOrderId: (id: string) => void;
  shiftForms: Record<string, ShiftForm>;
  updateShiftForm: (orderId: string, partial: Partial<ShiftForm>) => void;
  updateColorCount: (orderId: string, color: string, field: "good" | "bad", delta: number) => void;
  updateSingleCount: (orderId: string, field: "good" | "bad", delta: number) => void;
  lastSubmitConfirmation: string | null;
  submitShiftReport: (orderId: string) => void;

  productionProgress: Record<string, ProgressState>;

  resetDemo: () => void;
}

function buildInitialShiftForms(): Record<string, ShiftForm> {
  const forms: Record<string, ShiftForm> = {};
  for (const order of productionOrders) {
    forms[order.id] = initialShiftForm(order.actualCycleTimeS);
  }
  return forms;
}

const initialState = {
  currentScreen: 1 as ScreenId,
  currentModule: 0 as AppModuleId,
  activeUserId: "admin",
  lang: "pl" as Lang,
  moduleTabs: {
    1: "kartoteka", 2: "zamowienia", 3: "operator", 4: "tydzien", 5: "formy",
    // Moduł 9 otwiera się na raporcie właścicielskim — dla ról bez uprawnień
    // `resolveModuleTab` cofa to na Pulpit, więc nikt nie utknie na ukrytym widoku.
    6: "karty", 7: "karty", 8: "stany", 9: "wlascicielski",
  } as Partial<Record<ModuleId, string>>,
  recordFocus: {} as Partial<Record<ModuleId, string>>,
  mapFocus: null as ModuleId | null,
  inboxCounts: {} as Partial<Record<ModuleId, number>>,
  inboxMessages: {} as Partial<Record<ModuleId, string[]>>,
  routeConfirmation: null as { documentNumber: string; targets: ModuleId[] } | null,
  p105CalculationStale: false,
  purchasePriceApplied: false,
  moldF001InService: false,
  technologyNotes: [] as string[],
  planSetupHours: 3,
  materialConsumedKg: 0,
  selectedProductId: "P-101",
  plasticPriceChangePct: 0,
  applyToAllProducts: false,
  selectedOrderId: "ZP/2026/218",
  suggestedPriceRevealed: {} as Record<string, boolean>,
  activeReportOrderId: "ZP/2026/218",
  shiftForms: buildInitialShiftForms(),
  lastSubmitConfirmation: null as string | null,
  productionProgress: { ...initialProgress },
};

export const useDemoStore = create<DemoState>((set, get) => ({
  ...initialState,

  setScreen: (screen) => set({ currentScreen: screen }),
  setModule: (currentModule) => set({ currentModule }),
  setActiveUser: (activeUserId) => set({ activeUserId }),
  setLang: (lang) => set({ lang }),
  setModuleTab: (module, tab) => set((s) => ({ moduleTabs: { ...s.moduleTabs, [module]: tab } })),
  setRecordFocus: (module, recordId) => set((s) => ({ recordFocus: { ...s.recordFocus, [module]: recordId } })),
  setMapFocus: (mapFocus) => set({ mapFocus }),
  acknowledgeInbox: (module) => set((s) => ({
    inboxCounts: { ...s.inboxCounts, [module]: 0 },
    inboxMessages: { ...s.inboxMessages, [module]: [] },
  })),
  closeRouteConfirmation: () => set({ routeConfirmation: null }),

  setSelectedProduct: (id) => set((s) => ({ selectedProductId: id, currentScreen: 2, currentModule: 1, moduleTabs: { ...s.moduleTabs, 1: "kalkulacja" } })),

  setPlasticPriceChangePct: (pct) => set({ plasticPriceChangePct: pct }),
  setApplyToAllProducts: (v) => set({ applyToAllProducts: v }),

  setSelectedOrder: (id) => set({ selectedOrderId: id }),
  revealSuggestedPrice: (orderId) =>
    set((s) => ({ suggestedPriceRevealed: { ...s.suggestedPriceRevealed, [orderId]: true } })),

  setActiveReportOrderId: (id) => set({ activeReportOrderId: id }),

  updateShiftForm: (orderId, partial) =>
    set((s) => ({
      shiftForms: {
        ...s.shiftForms,
        [orderId]: { ...s.shiftForms[orderId], ...partial },
      },
    })),

  updateColorCount: (orderId, color, field, delta) =>
    set((s) => {
      const form = s.shiftForms[orderId];
      const current = form.colorCounts[color] ?? { good: 0, bad: 0 };
      const updated = { ...current, [field]: Math.max(0, current[field] + delta) };
      return {
        shiftForms: {
          ...s.shiftForms,
          [orderId]: {
            ...form,
            colorCounts: { ...form.colorCounts, [color]: updated },
          },
        },
      };
    }),

  updateSingleCount: (orderId, field, delta) =>
    set((s) => {
      const form = s.shiftForms[orderId];
      const updated = { ...form.singleCount, [field]: Math.max(0, form.singleCount[field] + delta) };
      return {
        shiftForms: {
          ...s.shiftForms,
          [orderId]: { ...form, singleCount: updated },
        },
      };
    }),

  submitShiftReport: (orderId) =>
    set((s) => {
      const form = s.shiftForms[orderId];
      let addGood = form.singleCount.good;
      let addBad = form.singleCount.bad;
      for (const cc of Object.values(form.colorCounts)) {
        addGood += cc.good;
        addBad += cc.bad;
      }
      const prev = s.productionProgress[orderId] ?? { producedGood: 0, producedBad: 0 };
      const resetColorCounts: Record<string, ColorCount> = {};
      for (const color of Object.keys(form.colorCounts)) resetColorCounts[color] = { good: 0, bad: 0 };

      return {
        productionProgress: {
          ...s.productionProgress,
          [orderId]: {
            producedGood: prev.producedGood + addGood,
            producedBad: prev.producedBad + addBad,
          },
        },
        shiftForms: {
          ...s.shiftForms,
          [orderId]: { ...form, singleCount: { good: 0, bad: 0 }, colorCounts: resetColorCounts, notes: "" },
        },
        lastSubmitConfirmation: `Raport zmiany ${form.shift} zatwierdzony — dodano ${addGood + addBad} szt.`,
      };
    }),

  submitLeadShiftReport: () =>
    set((s) => {
      const targets: ModuleId[] = [3, 4, 5, 6, 8];
      const inboxCounts = { ...s.inboxCounts };
      const inboxMessages = { ...s.inboxMessages };
      const effects: Partial<Record<ModuleId, string>> = {
        3: "RZ/2026/0431 przeliczył koszt rzeczywisty zlecenia.",
        4: "Plan przyjął rzeczywiste przezbrojenie 4,5 h i skorygował termin.",
        5: "Licznik F-001 został zaktualizowany; forma otrzymała status SERWIS.",
        6: "Do KT/P-105/W4 dopisano uwagę o cyklu 39 s i wypychaczu.",
        8: "Ze stanu zdjęto materiał zużyty w produkcji.",
      };
      for (const id of targets) {
        inboxCounts[id] = (inboxCounts[id] ?? 0) + 1;
        inboxMessages[id] = [...(inboxMessages[id] ?? []), effects[id]!];
      }
      return {
        inboxCounts,
        inboxMessages,
        routeConfirmation: { documentNumber: "RZ/2026/0431", targets },
        moldF001InService: true,
        technologyNotes: [...s.technologyNotes, "RZ/2026/0431: cykl 39 s; zacinanie wypychacza gniazda 2."],
        planSetupHours: 4.5,
        materialConsumedKg: 112.6,
      };
    }),

  finalizeCostSettlement: () =>
    set((s) => ({
      p105CalculationStale: true,
      routeConfirmation: { documentNumber: "RKR/2026/0218", targets: [1, 9] },
      inboxCounts: { ...s.inboxCounts, 1: (s.inboxCounts[1] ?? 0) + 1, 9: (s.inboxCounts[9] ?? 0) + 1 },
      inboxMessages: {
        ...s.inboxMessages,
        1: [...(s.inboxMessages[1] ?? []), "RKR/2026/0218 oznaczyło kalkulację P-105 jako NIEAKTUALNĄ."],
        9: [...(s.inboxMessages[9] ?? []), "RKR/2026/0218 zasiliło analizę straty ZP/2026/218."],
      },
    })),

  applyPurchaseInvoice: () =>
    set((s) => ({
      purchasePriceApplied: true,
      p105CalculationStale: true,
      routeConfirmation: { documentNumber: "FZ/2026/0619", targets: [1, 9] },
      inboxCounts: { ...s.inboxCounts, 1: (s.inboxCounts[1] ?? 0) + 1, 9: (s.inboxCounts[9] ?? 0) + 1 },
      inboxMessages: {
        ...s.inboxMessages,
        1: [...(s.inboxMessages[1] ?? []), "FZ/2026/0619 zmieniła cenę TPE-S 4055 z 18,00 na 19,40 zł/kg."],
        9: [...(s.inboxMessages[9] ?? []), "Analityka przyjęła nową cenę zakupową TPE-S 4055."],
      },
    })),

  // Język przetrwa reset — prezentacja po angielsku nie wraca nagle do polskiego.
  resetDemo: () =>
    set((s) => ({
      ...initialState,
      lang: s.lang,
      shiftForms: buildInitialShiftForms(),
      productionProgress: { ...initialProgress },
      suggestedPriceRevealed: {},
    })),
}));
