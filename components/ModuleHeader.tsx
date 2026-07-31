"use client";

import { Map, ArrowRight, ArrowLeft } from "lucide-react";
import { moduleConfigs, resolveModuleTab, visibleModuleTabs } from "@/lib/module-config";
import { getSystemUser, isOwner } from "@/lib/access-control";
import { useDemoStore } from "@/store/useDemoStore";
import type { ModuleId } from "@/lib/types";
import { useT } from "@/lib/use-t";

export function ModuleHeader({ moduleId }: { moduleId: ModuleId }) {
  const t = useT();
  const config = moduleConfigs[moduleId];
  const setModule = useDemoStore((s) => s.setModule);
  const owner = isOwner(getSystemUser(useDemoStore((s) => s.activeUserId)));
  const storedTab = useDemoStore((s) => s.moduleTabs[moduleId]);
  const activeTab = resolveModuleTab(moduleId, storedTab, owner);
  const setModuleTab = useDemoStore((s) => s.setModuleTab);

  return (
    <>
      <section className="border-b border-(--color-border) bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h1 className="text-[19px] font-bold tracking-tight text-(--color-navy)">
              {t("MODUŁ")} {moduleId} · {t(config.name)}
            </h1>
            <p className="mt-1 max-w-4xl text-[12.5px] leading-relaxed text-(--color-ink-soft)">{t(config.description)}</p>
          </div>
          <button onClick={() => { useDemoStore.getState().setMapFocus(moduleId); setModule(0); }} className="flex shrink-0 items-center gap-2 rounded-sm border border-(--color-border-strong) bg-white px-3 py-2 text-[12px] font-semibold text-(--color-navy) hover:bg-(--color-steel-light)">
            <Map size={14} /> {t("Gdzie jestem w systemie")}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-[1.4fr_1fr_1fr] gap-4 border-t border-(--color-border) pt-3 text-[11.5px]">
          <div>
            <div className="mb-1 font-semibold uppercase tracking-wide text-(--color-ink-faint)">{t("Dokumenty w tym module")}</div>
            <div className="flex flex-wrap gap-1.5">{config.documents.map((d) => <span key={d.symbol} className="rounded-sm border border-(--color-border) bg-(--color-bg) px-2 py-1"><b className="text-(--color-navy)">{d.symbol}</b> · {t(d.name)}</span>)}</div>
          </div>
          <ModuleLinks label={t("Skąd przychodzą dane")} icon={<ArrowLeft size={11} />} ids={config.incoming} onSelect={setModule} />
          <ModuleLinks label={t("Dokąd wychodzą dane")} icon={<ArrowRight size={11} />} ids={config.outgoing} onSelect={setModule} />
        </div>
      </section>
      <nav className="flex border-b border-(--color-border) bg-(--color-bg) px-5">
        {[...visibleModuleTabs(moduleId, owner), { id: "archiwum", label: t("Archiwum dokumentów") }].map((tab) => (
          <button key={tab.id} onClick={() => setModuleTab(moduleId, tab.id)} className={`border-b-2 px-4 py-2.5 text-[12.5px] font-medium ${activeTab === tab.id ? "border-(--color-steel) text-(--color-navy)" : "border-transparent text-(--color-ink-soft) hover:text-(--color-navy)"}`}>{t(tab.label)}</button>
        ))}
      </nav>
    </>
  );
}

function ModuleLinks({ label, icon, ids, onSelect }: { label: string; icon: React.ReactNode; ids: ModuleId[]; onSelect: (id: ModuleId) => void }) {
  const t = useT();
  return <div><div className="mb-1 font-semibold uppercase tracking-wide text-(--color-ink-faint)">{label}</div><div className="flex flex-wrap gap-1">{ids.length ? ids.map((id) => <button key={id} onClick={() => onSelect(id)} className="flex items-center gap-1 rounded-sm border border-(--color-steel) px-2 py-1 font-semibold text-(--color-steel) hover:bg-(--color-steel-light)">{icon} {id} · {t(moduleConfigs[id].shortName)}</button>) : <span className="text-(--color-ink-faint)">—</span>}</div></div>;
}
