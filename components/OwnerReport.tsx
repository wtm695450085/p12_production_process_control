"use client";

import { Fragment, useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, ChevronRight, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { costedProductionBatches } from "@/lib/production-batches";
import { computeBatchTKW } from "@/lib/tkw";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/calculations";
import { StatusExplainer, TkwBreakdown, statusChip } from "@/components/TkwBreakdown";
import { useT, useLang } from "@/lib/use-t";
import type { TkwReport } from "@/lib/types";

type SortKey = "odchylenie" | "data";

export function OwnerReport() {
  const t = useT();
  const lang = useLang();
  const [sortKey, setSortKey] = useState<SortKey>("odchylenie");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusBatchId, setStatusBatchId] = useState<string | null>(null);

  // Etykiety nośników powstają razem z raportem, więc zmiana języka musi
  // przeliczyć raport, a nie tylko przetłumaczyć nagłówki.
  const reports = useMemo(() => {
    const computed = costedProductionBatches
      .map((batch) => computeBatchTKW(batch, undefined, lang))
      .filter((report): report is TkwReport => report !== null);

    return computed.sort((a, b) =>
      sortKey === "odchylenie"
        ? b.variancePct - a.variancePct
        : b.batch.startedAt.localeCompare(a.batch.startedAt)
    );
  }, [sortKey, lang]);

  const overspend = reports.filter((report) => report.variance > 0);
  const moneyImpact = reports.reduce(
    (total, report) => total + report.variance * report.batch.costParameters!.realized.qGood,
    0
  );
  const worst = reports.reduce((prev, report) => (report.variancePct > prev.variancePct ? report : prev), reports[0]!);
  const statusReport = reports.find((report) => report.batch.id === statusBatchId) ?? null;

  return (
    <div className="p-6">
      <div className="mb-5 grid grid-cols-4 gap-4">
        <Tile
          icon={<Wallet size={18} />}
          label={t("Wpływ odchyleń na wynik")}
          value={formatCurrency(moneyImpact, 0, lang)}
          tone={moneyImpact > 0 ? "bad" : "good"}
          note={moneyImpact > 0 ? t("tyle produkcja kosztowała ponad plan") : t("tyle zaoszczędzono względem planu")}
        />
        <Tile
          icon={<TrendingUp size={18} />}
          label={t("Szarże powyżej planu")}
          value={`${overspend.length} / ${reports.length}`}
          tone={overspend.length > reports.length / 2 ? "bad" : "neutral"}
          note={t("liczba szarż droższych niż zakładano")}
        />
        <Tile
          icon={<TrendingDown size={18} />}
          label={t("Największe odchylenie")}
          value={formatPercent(worst.variancePct, 1, lang)}
          tone="bad"
          note={`${worst.product.id} · ${worst.batch.id}`}
        />
        <Tile
          icon={<span className="text-[15px] font-bold">Ø</span>}
          label={t("Średnie odchylenie TKW")}
          value={formatPercent(reports.reduce((sum, r) => sum + r.variancePct, 0) / reports.length, 1, lang)}
          tone="neutral"
          note={t("średnia po wszystkich szarżach")}
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-(--color-navy)">
            {t("Techniczny koszt wytworzenia — plan wobec realizacji")}
          </h2>
          <p className="mt-0.5 text-[11.5px] text-(--color-ink-soft)">
            {t("Kliknij wiersz, żeby zobaczyć rozbicie obu kwot na sześć składników wraz z dokumentami źródłowymi. Kliknij status, żeby poznać regułę, która go nadała.")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSortKey(sortKey === "odchylenie" ? "data" : "odchylenie")}
          className="flex items-center gap-2 rounded-sm border border-(--color-border-strong) bg-white px-3 py-2 text-[12px] font-semibold text-(--color-navy) hover:bg-(--color-steel-light)"
        >
          <ArrowDownUp size={13} />
          {sortKey === "odchylenie" ? t("Sortuj: wg odchylenia") : t("Sortuj: wg daty")}
        </button>
      </div>

      <div className="overflow-hidden rounded-sm border border-(--color-border) bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-(--color-navy) bg-(--color-bg) text-[11px] uppercase tracking-wide text-(--color-ink-faint)">
              <th className="px-4 py-3 text-left font-semibold">{t("Produkt")}</th>
              <th className="px-3 py-3 text-left font-semibold">{t("Rozpoczęcie")}</th>
              <th className="px-3 py-3 text-left font-semibold">{t("Zakończenie")}</th>
              <th className="px-3 py-3 text-right font-semibold">{t("TKW plan")}</th>
              <th className="px-3 py-3 text-right font-semibold">{t("TKW zrealizowany")}</th>
              <th className="px-3 py-3 text-right font-semibold">{t("Odchylenie")}</th>
              <th className="px-4 py-3 text-center font-semibold">{t("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const chip = statusChip[report.status];
              const worse = report.variance > 0;
              const selected = selectedId === report.batch.id;
              return (
                <Fragment key={report.batch.id}>
                <tr
                  onClick={() => setSelectedId(selected ? null : report.batch.id)}
                  className={`cursor-pointer border-b border-(--color-border) transition-colors ${
                    selected ? "bg-(--color-steel-light)" : "hover:bg-(--color-bg)"
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-(--color-steel)">
                        {selected ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <div>
                        <div className="text-[15px] font-bold text-(--color-navy)">{t(report.product.name)}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-(--color-ink-faint)">
                          {report.product.id} · {t("szarża")} {report.batch.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[13px] text-(--color-ink-soft)">
                    {report.batch.startedAt.replace("T", " ")}
                  </td>
                  <td className="px-3 py-4 text-[13px] text-(--color-ink-soft)">
                    {report.batch.finishedAt?.replace("T", " ") ?? "—"}
                  </td>
                  <td className="tabular px-3 py-4 text-right text-[16px] font-semibold">
                    {formatCurrency(report.plannedUnitCost, 4, lang)}
                  </td>
                  <td
                    className="tabular px-3 py-4 text-right text-[16px] font-bold"
                    style={{ color: worse ? "var(--color-status-red)" : "var(--color-status-green)" }}
                  >
                    {formatCurrency(report.realizedUnitCost, 4, lang)}
                  </td>
                  <td
                    className="tabular px-3 py-4 text-right"
                    style={{ color: worse ? "var(--color-status-red)" : "var(--color-status-green)" }}
                  >
                    <div className="text-[16px] font-bold">
                      {worse ? "+" : "−"}
                      {formatNumber(Math.abs(report.variance), 4, lang)} zł
                    </div>
                    <div className="text-[12px] font-semibold">
                      {worse ? "+" : "−"}
                      {formatNumber(Math.abs(report.variancePct), 1, lang)}%
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      title={t("Zobacz regułę, która nadała ten status")}
                      onClick={(event) => {
                        event.stopPropagation();
                        setStatusBatchId(report.batch.id);
                      }}
                      className={`inline-block rounded-sm border border-transparent px-2.5 py-1.5 text-[10.5px] font-bold hover:border-current ${chip.className}`}
                    >
                      {t(chip.label)} <span className="font-normal">ⓘ</span>
                    </button>
                  </td>
                </tr>
                {selected && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <TkwBreakdown report={report} onClose={() => setSelectedId(null)} />
                    </td>
                  </tr>
                )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {statusReport && <StatusExplainer report={statusReport} onClose={() => setStatusBatchId(null)} />}

      <p className="mt-3 text-[11.5px] text-(--color-ink-faint)">
        {t("Raport obejmuje szarże z kompletem parametrów kosztowych. Kolumna „TKW zrealizowany” jest liczona z danych produkcyjnych szarży — brakowości, czasu cyklu, przestojów, przezbrojeń i zużycia formy.")}
      </p>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  tone: "good" | "bad" | "neutral";
}) {
  const color =
    tone === "bad" ? "var(--color-status-red)" : tone === "good" ? "var(--color-status-green)" : "var(--color-navy)";
  return (
    <div className="rounded-sm border border-(--color-border) bg-white p-4">
      <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wide text-(--color-ink-faint)">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="tabular mt-2 text-[26px] font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-(--color-ink-soft)">{note}</div>
    </div>
  );
}
