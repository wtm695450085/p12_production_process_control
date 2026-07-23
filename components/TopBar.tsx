"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useDemoStore, type ScreenId } from "@/store/useDemoStore";

const TITLES: Record<ScreenId, { title: string; subtitle: string }> = {
  1: { title: "Produkty", subtitle: "Portfolio produktów i ich rentowność jednostkowa" },
  2: { title: "Karta produktu i kalkulacja", subtitle: "Rozbicie kosztu, wrażliwość na cenę tworzyw" },
  3: { title: "Raport zmianowy", subtitle: "Panel operatorski — rejestracja produkcji na hali" },
  4: { title: "Rozliczenie produkcji", subtitle: "Kalkulacja kontra rzeczywistość dla zakończonych zleceń" },
  5: { title: "Rentowność portfela", subtitle: "Marża procentowa kontra marża na maszynogodzinę" },
};

export function TopBar() {
  const currentScreen = useDemoStore((s) => s.currentScreen);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const [justReset, setJustReset] = useState(false);
  const { title, subtitle } = TITLES[currentScreen];

  return (
    <header className="flex items-center justify-between border-b border-(--color-border) bg-(--color-card) px-6 py-3.5">
      <div>
        <h1 className="text-[16px] font-semibold text-(--color-ink)">{title}</h1>
        <p className="text-[12.5px] text-(--color-ink-soft)">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          resetDemo();
          setJustReset(true);
          setTimeout(() => setJustReset(false), 1600);
        }}
        className="flex items-center gap-1.5 rounded-sm border border-(--color-border-strong) bg-white px-3 py-2 text-[12.5px] font-medium text-(--color-ink-soft) transition-colors hover:border-(--color-steel) hover:text-(--color-steel)"
      >
        <RotateCcw size={14} />
        {justReset ? "Zresetowano" : "Reset demo"}
      </button>
    </header>
  );
}
