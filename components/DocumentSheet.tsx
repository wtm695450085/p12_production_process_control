"use client";

import { useRef, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { documentRoutes } from "@/lib/document-routes";
import { moduleConfigs } from "@/lib/module-config";
import { useDemoStore } from "@/store/useDemoStore";
import type { DocumentMeta } from "@/lib/types";
import { exportDocumentToExcel } from "@/lib/excel-export";
import { useT } from "@/lib/use-t";

const statusClass = { roboczy: "bg-gray-100 text-gray-700", zlozony: "bg-(--color-status-amber-bg) text-(--color-status-amber)", zatwierdzony: "bg-(--color-status-green-bg) text-(--color-status-green)", skorygowany: "bg-(--color-status-red-bg) text-(--color-status-red)" };

export function DocumentSheet({ meta, title, children, actions }: { meta: DocumentMeta; title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  const t = useT();
  const setModule = useDemoStore((s) => s.setModule);
  const route = documentRoutes.find((r) => r.symbol === meta.symbol);
  const articleRef=useRef<HTMLElement>(null);
  const [exporting,setExporting]=useState(false);
  async function exportExcel(){
    const fields=[...(articleRef.current?.querySelectorAll<HTMLElement>("[data-document-field]")??[])].map(element=>({label:element.dataset.label??"",value:element.querySelector<HTMLElement>("[data-document-value]")?.innerText.trim()??""}));
    setExporting(true);
    try { await exportDocumentToExcel(meta,title,fields); } finally { setExporting(false); }
  }
  return (
    <article ref={articleRef} className="border-2 border-(--color-border-strong) bg-white font-sans">
      <header className="flex items-start justify-between border-b-2 border-(--color-navy) px-5 py-4">
        <div className="flex gap-3"><FileText className="mt-0.5 text-(--color-navy)" size={22} /><div><div className="font-mono text-[16px] font-bold text-(--color-navy)">{meta.number}</div><div className="text-[13px] font-semibold">{t(title)}</div></div></div>
        <div className="flex items-center gap-2"><button type="button" onClick={exportExcel} disabled={exporting} className="flex items-center gap-1.5 rounded-sm border border-[#217346] bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-[#217346] hover:bg-[#e9f5ee] disabled:opacity-50"><Download size={13}/>{exporting?t("Tworzenie…"):t("Eksport do Excel")}</button><span className={`rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusClass[meta.status]}`}>{t(meta.status)}</span></div>
      </header>
      <div className="grid grid-cols-4 border-b border-(--color-border) bg-(--color-bg) text-[11.5px]">
        <Meta label={t("Autor")} value={meta.author} />
        <Meta label={t("Rola")} value={t(meta.authorRole)} />
        <Meta label={t("Data")} value={meta.date.replace("T", " ")} />
        <Meta label={t("Powiązanie")} value={meta.relatedOrderId ?? "—"} />
      </div>
      <div className="p-5">{children}</div>
      {actions && <div className="border-t border-(--color-border) px-5 py-3">{actions}</div>}
      {route && <footer className="border-t-2 border-(--color-navy) bg-(--color-steel-light) px-5 py-4"><div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-(--color-navy)">{t("Trasa dokumentu")}</div><div className="grid gap-1.5">{route.targets.map((target) => <button key={target.moduleId} onClick={() => setModule(target.moduleId)} className="flex items-center gap-2 text-left text-[12px] hover:underline"><ExternalLink size={12} className="text-(--color-steel)" /><b>→ {t("MODUŁ")} {target.moduleId} · {t(moduleConfigs[target.moduleId].shortName)}</b><span className="text-(--color-ink-soft)">— {t(target.effect)}</span></button>)}</div></footer>}
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="border-r border-(--color-border) px-3 py-2 last:border-r-0"><div className="uppercase tracking-wide text-(--color-ink-faint)">{label}</div><div className="mt-0.5 font-medium text-(--color-ink)">{value}</div></div>;
}

export function DocumentField({ label, value, source, changed }: { label: string; value: React.ReactNode; source?: string; changed?: boolean }) {
  return <div data-document-field data-label={label} className={`grid min-h-10 grid-cols-[170px_1fr] border-b border-(--color-border) ${changed ? "bg-[#fff7d6]" : ""}`}><div className="bg-(--color-bg) px-3 py-2 text-[11.5px] font-medium text-(--color-ink-soft)">{label}</div><div data-document-value className="flex items-center justify-between gap-2 px-3 py-2 font-mono text-[12.5px] font-semibold">{value}{source && <button title={`Wartość z ${source}`} className="rounded-full border border-(--color-steel) px-1.5 py-0.5 font-sans text-[9px] text-(--color-steel)">↗ {source}</button>}</div></div>;
}
