"use client";

import { Boxes, Calculator, ClipboardList, Factory, Map, Package, ScrollText, Settings, ShieldCheck, TrendingUp, Warehouse } from "lucide-react";
import { moduleConfigs, moduleOrder } from "@/lib/module-config";
import { useDemoStore } from "@/store/useDemoStore";
import { useT } from "@/lib/use-t";

const icons = { 0: Map, 1: Boxes, 2: ScrollText, 3: ClipboardList, 4: Factory, 5: Settings, 6: Calculator, 7: Package, 8: Warehouse, 9: TrendingUp, 10: ShieldCheck };

export function Sidebar() {
  const t = useT();
  const current = useDemoStore((s) => s.currentModule);
  const setModule = useDemoStore((s) => s.setModule);
  const counts = useDemoStore((s) => s.inboxCounts);
  let lastGroup = "";
  return <nav className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-(--color-navy) text-white">
    <div className="border-b border-white/10 px-4 py-4"><div className="text-[13px] font-bold tracking-wide">{t("P12 · STEROWANIE PRODUKCJĄ")}</div><div className="text-[10.5px] text-white/45">{t("obieg dokumentów · demo")}</div></div>
    <div className="p-2">
      {moduleOrder.map((id) => {
        const config = id === 0 ? null : moduleConfigs[id];
        const group = id === 0 ? "" : config!.group;
        const showGroup = group && group !== lastGroup;
        if (group) lastGroup = group;
        const Icon = icons[id];
        const count = id === 0 ? 0 : counts[id] ?? 0;
        return <div key={id}>
          {id === 1 && <div className="my-2 border-t border-white/10" />}
          {showGroup && <div className="px-3 pb-1 pt-3 text-[9.5px] font-bold tracking-[0.14em] text-white/35">{t(group)}</div>}
          <button onClick={() => setModule(id)} className={`relative flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-[12.5px] ${current === id ? "bg-(--color-steel) font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
            <Icon size={15} /><span className="w-4 font-mono text-[11px] text-white/45">{id}</span><span className="flex-1">{id === 0 ? t("Mapa systemu") : t(config!.name)}</span>
            {count > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-(--color-status-red) px-1 text-[10px] font-bold text-white">{count}</span>}
          </button>
        </div>;
      })}
    </div>
    <div className="mt-auto border-t border-white/10 p-2"><button onClick={() => setModule(10)} className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-[12px] ${current===10?"bg-(--color-steel) text-white":"text-white/70 hover:bg-white/10"}`}><ShieldCheck size={15}/><span className="font-mono text-[11px] text-white/45">A</span><span>{t("Zarządzanie dostępem")}</span></button><div className="px-3 pt-2 text-[10px] text-white/35">{t("Klawisze 0–9 · M mapa · A dostęp")}</div></div>
  </nav>;
}
