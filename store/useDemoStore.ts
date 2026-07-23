import { create } from "zustand";
import { operators, productionOrders } from "@/lib/seed-data";
import type { WorkMode } from "@/lib/types";

export type ScreenId = 1 | 2 | 3 | 4 | 5;

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

  setSelectedProduct: (id) => set({ selectedProductId: id, currentScreen: 2 }),

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

  resetDemo: () =>
    set({
      ...initialState,
      shiftForms: buildInitialShiftForms(),
      productionProgress: { ...initialProgress },
      suggestedPriceRevealed: {},
    }),
}));
