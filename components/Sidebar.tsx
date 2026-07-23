"use client";

import { Boxes, Calculator, ClipboardList, ReceiptText, TrendingUp } from "lucide-react";
import { useDemoStore, type ScreenId } from "@/store/useDemoStore";

const NAV_ITEMS: { id: ScreenId; label: string; icon: typeof Boxes }[] = [
  { id: 1, label: "Produkty", icon: Boxes },
  { id: 2, label: "Kalkulacja", icon: Calculator },
  { id: 3, label: "Raport zmianowy", icon: ClipboardList },
  { id: 4, label: "Rozliczenie produkcji", icon: ReceiptText },
  { id: 5, label: "Rentowność", icon: TrendingUp },
];

export function Sidebar() {
  const currentScreen = useDemoStore((s) => s.currentScreen);
  const setScreen = useDemoStore((s) => s.setScreen);

  return (
    <nav className="flex w-56 shrink-0 flex-col border-r border-(--color-border) bg-(--color-navy) text-white">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="text-[13px] font-semibold tracking-wide text-white">CONTROLLING PRODUKCJI</div>
        <div className="text-[11px] text-white/50">wtryskownia · demo</div>
      </div>
      <ul className="flex flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentScreen === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setScreen(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-[13.5px] transition-colors ${
                  active
                    ? "bg-(--color-steel) text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} strokeWidth={2} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="tabular text-[11px] text-white/35">{item.id}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto border-t border-white/10 px-4 py-3 text-[11px] leading-snug text-white/40">
        Skróty klawiszowe 1–5 przełączają ekrany.
      </div>
    </nav>
  );
}
