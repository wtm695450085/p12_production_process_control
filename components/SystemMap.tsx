"use client";
import { useState } from "react";
import { moduleConfigs } from "@/lib/module-config";
import { useDemoStore } from "@/store/useDemoStore";
import type { ModuleId } from "@/lib/types";
import { useT } from "@/lib/use-t";

const boxes: Record<ModuleId, { x: number; y: number }> = {
  1: { x: 70, y: 90 }, 5: { x: 290, y: 90 }, 6: { x: 510, y: 90 }, 7: { x: 730, y: 90 },
  2: { x: 180, y: 250 }, 4: { x: 430, y: 250 }, 8: { x: 680, y: 250 },
  3: { x: 430, y: 410 }, 9: { x: 430, y: 570 },
};
const links: [ModuleId, ModuleId, string][] = [[1,2,"KP"],[2,4,"ZP"],[2,8,"ZK/ZP"],[2,3,"ZP"],[5,4,"ZAF/PSF"],[6,3,"KT"],[7,8,"KL"],[3,4,"RZ"],[3,5,"RZ/ZAF"],[3,6,"RZ/RN"],[3,8,"RZ"],[3,9,"RKR"],[8,1,"FZ"],[8,9,"FZ"],[1,9,"AK"]];

export function SystemMap() {
  const t = useT();
  const focus = useDemoStore((s) => s.mapFocus); const setModule = useDemoStore((s) => s.setModule);
  const [only, setOnly] = useState(false);
  const related = new Set<ModuleId>();
  if (focus) links.forEach(([a,b]) => { if (a === focus) related.add(b); if (b === focus) related.add(a); });
  return <div className="p-6">
    <div className="mb-4 flex items-start justify-between"><div><h1 className="text-[20px] font-bold text-(--color-navy)">{t("MAPA SYSTEMU · obieg dokumentów P12")}</h1><p className="mt-1 text-[12.5px] text-(--color-ink-soft)">{t("Moduł 0 — rozpoznanie w zakładzie — jest punktem wyjścia przed wdrożeniem, a nie zakładką operacyjną.")}</p></div><label className="flex items-center gap-2 text-[11.5px]"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} className="accent-[#1F3864]"/>{t("Pokaż tylko przepływ dokumentów wybranego modułu")}</label></div>
    <div className="border border-(--color-border) bg-white p-3">
      <svg viewBox="0 0 1000 720" className="h-[620px] w-full">
        <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#8791a1"/></marker><marker id="redArrow" markerWidth="9" markerHeight="9" refX="8" refY="3.5" orient="auto"><path d="M0,0 L0,7 L9,3.5 z" fill="#c62828"/></marker></defs>
        {[[40,"WARSTWA 1 — DANE PODSTAWOWE"],[200,"WARSTWA 2 — PLANOWANIE"],[360,"WARSTWA 3 — WYKONANIE"],[520,"WARSTWA 4 — WNIOSKI"]].map(([y,l]) => <text key={l} x="20" y={y as number} fontSize="11" fontWeight="700" fill="#8791a1">{t(l as string)}</text>)}
        {links.map(([a,b,label]) => {
          if (only && focus && a !== focus && b !== focus) return null;
          const A=boxes[a], B=boxes[b]; const x1=A.x+90,y1=A.y+48,x2=B.x+90,y2=B.y;
          return <g key={`${a}-${b}`}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={focus && (a===focus||b===focus) ? "#2E74B5":"#c3c9d1"} strokeWidth={focus && (a===focus||b===focus)?2:1.2} markerEnd="url(#arrow)"><title>{label}</title></line><text x={(x1+x2)/2+4} y={(y1+y2)/2-3} fontSize="9" fill="#566072">{label}</text></g>;
        })}
        <path d="M430 455 C120 500, 40 350, 70 138" fill="none" stroke="#c62828" strokeWidth="5" markerEnd="url(#redArrow)"/>
        <text x="72" y="430" fontSize="12" fontWeight="800" fill="#c62828">{t("PĘTLA KOSZTOWA · RKR: 3 → 1")}</text>
        {(Object.keys(boxes) as unknown as ModuleId[]).map((id) => {
          const p=boxes[id]; const active=focus===id; const linked=focus && related.has(id); const dim=focus && !active && !linked;
          return <g key={id} onClick={() => setModule(id)} className="cursor-pointer"><rect x={p.x} y={p.y} width="180" height="48" rx="2" fill={active?"#fbe9e9":linked?"#eaf1f8":"#fff"} stroke={active?"#c62828":linked?"#2E74B5":"#1f3864"} strokeWidth={active?3:1.5} opacity={dim?.valueOf()?0.35:1}/><text x={p.x+12} y={p.y+20} fontSize="13" fontWeight="800" fill={active?"#c62828":"#1f3864"}>{id}</text><text x={p.x+34} y={p.y+20} fontSize="11.5" fontWeight="700" fill="#1a2027">{t(moduleConfigs[id].shortName)}</text><text x={p.x+12} y={p.y+37} fontSize="9.5" fill="#566072">{moduleConfigs[id].documents.map(d=>d.symbol).join(" · ")}</text></g>;
        })}
      </svg>
      <div className="border-t border-(--color-border) px-3 py-3 text-center text-[12.5px] italic text-(--color-ink-soft)">{t("„Każda strzałka to dokument, który przechodzi z jednego działu do drugiego. Dziś te dokumenty przechodzą na papierze i w arkuszach — i część z nich nie dociera.”")}</div>
    </div>
  </div>;
}
