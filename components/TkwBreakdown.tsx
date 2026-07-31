"use client";

import { useEffect } from "react";
import { ArrowRight, ExternalLink, Info, X } from "lucide-react";
import { computeProductEconomics, formatCurrency, formatNumber, formatPercent } from "@/lib/calculations";
import { describeVariance, tkwComponentLabels } from "@/lib/tkw";
import { driverSources, explainComponent, parameterRows, type SourceRef } from "@/lib/tkw-sources";
import { useDemoStore } from "@/store/useDemoStore";
import { useT, useLang } from "@/lib/use-t";
import type { Lang } from "@/lib/i18n";
import type { OrderStatus, TkwReport } from "@/lib/types";

export const statusChip: Record<OrderStatus, { label: string; className: string; color: string }> = {
  zielony: {
    label: "W NORMIE",
    className: "bg-(--color-status-green-bg) text-(--color-status-green)",
    color: "var(--color-status-green)",
  },
  zolty: {
    label: "DO SPRAWDZENIA",
    className: "bg-(--color-status-amber-bg) text-(--color-status-amber)",
    color: "var(--color-status-amber)",
  },
  czerwony: {
    label: "WYMAGA DECYZJI",
    className: "bg-(--color-status-red-bg) text-(--color-status-red)",
    color: "var(--color-status-red)",
  },
};

/** Przejście do modułu, w którym powstał wskazany dokument. */
function useOpenSource() {
  const setModule = useDemoStore((s) => s.setModule);
  const setModuleTab = useDemoStore((s) => s.setModuleTab);
  const setRecordFocus = useDemoStore((s) => s.setRecordFocus);
  const setSelectedProduct = useDemoStore((s) => s.setSelectedProduct);
  return (ref: SourceRef) => {
    // Moduł 1 wybiera wyrób własnym działaniem, które samo ustawia zakładkę
    // kalkulacji — pozostałe moduły dostają zaznaczenie rekordu na liście.
    if (ref.recordId && ref.moduleId === 1) {
      setSelectedProduct(ref.recordId);
      return;
    }
    if (ref.recordId) setRecordFocus(ref.moduleId, ref.recordId);
    setModuleTab(ref.moduleId, ref.tab);
    setModule(ref.moduleId);
  };
}

function SourceChip({ source }: { source: SourceRef }) {
  const t = useT();
  const open = useOpenSource();
  return (
    <button
      type="button"
      title={`${source.title} — ${t("moduł")} ${source.moduleId}`}
      onClick={(event) => {
        event.stopPropagation();
        open(source);
      }}
      className="inline-flex items-center gap-1 rounded-sm border border-(--color-steel) bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-(--color-steel) hover:bg-(--color-steel-light)"
    >
      <ExternalLink size={9} />
      {source.number}
    </button>
  );
}

function SourceList({ caption, sources }: { caption: string; sources: SourceRef[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[10px] uppercase tracking-wide text-(--color-ink-faint)">{caption}</span>
      {sources.map((source) => (
        <SourceChip key={`${caption}-${source.number}`} source={source} />
      ))}
    </div>
  );
}

function Money({ value, decimals = 4, tone, lang }: { value: number; decimals?: number; tone?: "bad" | "good"; lang: Lang }) {
  const color =
    tone === "bad" ? "var(--color-status-red)" : tone === "good" ? "var(--color-status-green)" : undefined;
  return (
    <span className="tabular font-semibold" style={{ color }}>
      {formatCurrency(value, decimals, lang)}
    </span>
  );
}

function Signed({ value, decimals = 4, lang }: { value: number; decimals?: number; lang: Lang }) {
  const worse = value > 0;
  return (
    <span
      className="tabular font-bold"
      style={{ color: worse ? "var(--color-status-red)" : "var(--color-status-green)" }}
    >
      {worse ? "+" : "−"}
      {formatNumber(Math.abs(value), decimals, lang)} zł
    </span>
  );
}

/**
 * Rozwinięcie wiersza raportu właścicielskiego: z czego składa się TKW plan i
 * TKW zrealizowany, z jakich dokumentów pochodzi każda liczba i który nośnik
 * odpowiada za różnicę między nimi.
 */
export function TkwBreakdown({ report, onClose }: { report: TkwReport; onClose: () => void }) {
  const t = useT();
  const lang = useLang();
  const worse = report.variance > 0;
  const componentSum = report.components.reduce((total, component) => total + component.realized, 0);
  const driverSum = report.drivers.reduce((total, driver) => total + driver.total, 0);
  const maxDriver = Math.max(...report.drivers.map((driver) => Math.abs(driver.total)), 1e-9);

  return (
    <div className="border-x-2 border-b-2 border-(--color-navy) bg-white">
      <header className="flex items-start justify-between gap-4 bg-(--color-navy) px-5 py-3 text-white">
        <div>
          <div className="text-[13px] font-bold">
            {report.batch.id} · {report.product.id} {t(report.product.name)} — {t("skąd się biorą te liczby")}
          </div>
          <div className="mt-1 max-w-[900px] text-[11.5px] text-white/80">{describeVariance(report, lang)}</div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="flex shrink-0 items-center gap-1 rounded-sm border border-white/40 px-2 py-1 text-[10.5px] font-semibold hover:bg-white/10"
        >
          <X size={12} />
          {t("Zwiń")}
        </button>
      </header>

      <div className="grid grid-cols-3 border-b border-(--color-border) bg-(--color-steel-light) text-center">
        <Headline label={t("TKW plan — suma sześciu składników")} value={formatCurrency(report.plannedUnitCost, 4, lang)} />
        <Headline
          label={t("TKW zrealizowany — suma sześciu składników")}
          value={formatCurrency(report.realizedUnitCost, 4, lang)}
          color={worse ? "var(--color-status-red)" : "var(--color-status-green)"}
        />
        <Headline
          label={t("Odchylenie — suma nośników poniżej")}
          value={`${worse ? "+" : "−"}${formatNumber(Math.abs(report.variance), 4, lang)} zł · ${
            worse ? "+" : "−"
          }${formatNumber(Math.abs(report.variancePct), 1, lang)}%`}
          color={worse ? "var(--color-status-red)" : "var(--color-status-green)"}
        />
      </div>

      <Section
        title={t("1 · Z czego składa się TKW")}
        lead={t("Sześć składników technicznego kosztu wytworzenia, każdy z pełnym działaniem i dokumentem, z którego pochodzą jego dane. Kolumny sumują się do liczb z wiersza tabeli.")}
      >
        <div className="grid grid-cols-[minmax(280px,1.15fr)_1fr_1fr_150px] border-b-2 border-(--color-navy) bg-(--color-bg) px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-(--color-ink-faint)">
          <div>{t("Składnik i jego dane źródłowe")}</div>
          <div className="text-right">{t("Plan — wyliczenie")}</div>
          <div className="text-right">{t("Realizacja — wyliczenie")}</div>
          <div className="text-right">{t("Odchylenie")}</div>
        </div>

        {report.components.map((component) => {
          const explain = explainComponent(report, component.id, lang);
          const index = tkwComponentLabels.findIndex((item) => item.id === component.id);
          return (
            <div
              key={component.id}
              className="grid grid-cols-[minmax(280px,1.15fr)_1fr_1fr_150px] gap-3 border-b border-(--color-border) px-4 py-3"
            >
              <div>
                <div className="text-[12.5px] font-bold text-(--color-navy)">
                  {index + 1}. {component.label}
                </div>
                <div className="mt-0.5 text-[11px] italic text-(--color-ink-soft)">{explain.formula}</div>
                <div className="mt-1.5 text-[10.5px] leading-snug text-(--color-ink-faint)">{explain.note}</div>
                <div className="mt-2 grid gap-1">
                  <SourceList caption={t("plan:")} sources={explain.planSources} />
                  <SourceList caption={t("realizacja:")} sources={explain.realizedSources} />
                </div>
              </div>

              <div className="text-right">
                <div className="text-[15px]">
                  <Money value={component.planned} lang={lang} />
                </div>
                <div className="mt-1 font-mono text-[10px] leading-snug text-(--color-ink-faint)">
                  {explain.planMath}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[15px]">
                  <Money
                    value={component.realized}
                    lang={lang}
                    tone={component.variance > 0.00005 ? "bad" : component.variance < -0.00005 ? "good" : undefined}
                  />
                </div>
                <div className="mt-1 font-mono text-[10px] leading-snug text-(--color-ink-faint)">
                  {explain.realizedMath}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[14px]">
                  <Signed value={component.variance} lang={lang} />
                </div>
                {component.variancePct !== null && (
                  <div
                    className="tabular mt-0.5 text-[11px] font-semibold"
                    style={{
                      color:
                        component.variance > 0 ? "var(--color-status-red)" : "var(--color-status-green)",
                    }}
                  >
                    {component.variance > 0 ? "+" : "−"}
                    {formatNumber(Math.abs(component.variancePct), 1, lang)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="grid grid-cols-[minmax(280px,1.15fr)_1fr_1fr_150px] gap-3 border-b-2 border-(--color-navy) bg-(--color-steel-light) px-4 py-3">
          <div className="text-[12.5px] font-bold uppercase tracking-wide text-(--color-navy)">
            {t("Razem — techniczny koszt wytworzenia")}
          </div>
          <div className="tabular text-right text-[17px] font-bold text-(--color-navy)">
            {formatCurrency(report.plannedUnitCost, 4, lang)}
          </div>
          <div
            className="tabular text-right text-[17px] font-bold"
            style={{ color: worse ? "var(--color-status-red)" : "var(--color-status-green)" }}
          >
            {formatCurrency(report.realizedUnitCost, 4, lang)}
          </div>
          <div className="text-right text-[15px]">
            <Signed value={report.variance} lang={lang} />
          </div>
        </div>

        <p className="px-4 py-2 text-[10.5px] text-(--color-ink-faint)">
          {t("Kontrola sumy: sześć składników realizacji daje")} {formatCurrency(componentSum, 4, lang)},{" "}
          {t("czyli dokładnie TKW zrealizowany z tabeli. Koszt techniczny wg kalkulacji z modułu 1 (bez przygotowania produkcji, amortyzacji formy i opakowania) wynosi")}{" "}
          {formatCurrency(report.technicalUnitCost, 4, lang)}.{" "}
          {t("Wartości pośrednie w wyliczeniach są zaokrąglone do prezentacji — kolumny liczone są na wartościach dokładnych.")}
        </p>
      </Section>

      <Section
        title={t("2 · Dane wejściowe i dokumenty, z których pochodzą")}
        lead={t("Plan pochodzi z kalkulacji i kart wyrobu, realizacja wyłącznie z dokumentów wystawionych na hali. Żadna liczba w tym raporcie nie jest wpisywana ręcznie w module 9.")}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-(--color-navy) bg-(--color-bg) text-[10px] uppercase tracking-wide text-(--color-ink-faint)">
              <th className="px-4 py-2 text-left font-bold">{t("Parametr")}</th>
              <th className="px-3 py-2 text-right font-bold">{t("Plan")}</th>
              <th className="px-3 py-2 text-left font-bold">{t("Dokument planu")}</th>
              <th className="px-3 py-2 text-right font-bold">{t("Realizacja")}</th>
              <th className="px-4 py-2 text-left font-bold">{t("Dokument realizacji")}</th>
            </tr>
          </thead>
          <tbody>
            {parameterRows(report, lang).map((row) => (
              <tr key={row.label} className="border-b border-(--color-border) align-top">
                <td className="px-4 py-2.5">
                  <div className="text-[12px] font-semibold text-(--color-ink)">{row.label}</div>
                  {row.comment && (
                    <div className="mt-0.5 max-w-[320px] text-[10.5px] leading-snug text-(--color-ink-faint)">
                      {row.comment}
                    </div>
                  )}
                </td>
                <td className="tabular px-3 py-2.5 text-right font-mono text-[12px]">{row.plan}</td>
                <td className="px-3 py-2.5">
                  <SourceChip source={row.planSource} />
                </td>
                <td
                  className="tabular px-3 py-2.5 text-right font-mono text-[12px] font-bold"
                  style={{ color: row.changed ? "var(--color-status-red)" : undefined }}
                >
                  {row.realized}
                </td>
                <td className="px-4 py-2.5">
                  <SourceChip source={row.realizedSource} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title={t("3 · Mostek: dlaczego realizacja różni się od planu")}
        lead={t("Każdy nośnik jest liczony przez podstawienie jednej zmiany do modelu kosztowego, po kolei. Dzięki temu nośniki sumują się do odchylenia co do grosza — bez pozycji „pozostałe”.")}
      >
        <div className="px-4 py-3">
          <BridgeRow
            label={t("TKW plan")}
            value={formatCurrency(report.plannedUnitCost, 4, lang)}
            strong
            background="bg-(--color-bg)"
          />
          {report.drivers.map((driver) => {
            const bad = driver.total > 0;
            const affected = driver.perComponent
              .map((value, index) => ({ value, component: report.components[index]! }))
              .filter((item) => Math.abs(item.value) > 0.00005)
              .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
            return (
              <div key={driver.id} className="border-b border-(--color-border) py-2.5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-(--color-ink)">{driver.label}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <SourceList caption={t("źródło:")} sources={driverSources(report, driver.id, lang)} />
                    </div>
                    {affected.length > 0 && (
                      <div className="mt-1 text-[10.5px] text-(--color-ink-faint)">
                        {t("wpływa na:")}{" "}
                        {affected
                          .map(
                            (item) =>
                              `${item.component.label.toLowerCase()} ${item.value > 0 ? "+" : "−"}${formatNumber(
                                Math.abs(item.value),
                                4
                              , lang)} zł`
                          )
                          .join(" · ")}
                      </div>
                    )}
                  </div>
                  <div className="flex w-[320px] shrink-0 items-center gap-3">
                    <div className="h-3 flex-1 bg-(--color-bg)">
                      <div
                        className="h-3"
                        style={{
                          width: `${(Math.abs(driver.total) / maxDriver) * 100}%`,
                          background: bad ? "var(--color-status-red)" : "var(--color-status-green)",
                        }}
                      />
                    </div>
                    <div className="w-[110px] text-right text-[13px]">
                      <Signed value={driver.total} lang={lang} />
                    </div>
                    <div className="tabular w-[52px] text-right text-[11px] text-(--color-ink-faint)">
                      {formatNumber((driver.total / report.variance) * 100, 0, lang)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between border-b border-(--color-border) py-2.5">
            <div className="text-[12px] font-bold uppercase tracking-wide text-(--color-navy)">
              {t("Razem nośniki")}
            </div>
            <div className="text-[14px]">
              <Signed value={driverSum} lang={lang} />
            </div>
          </div>
          <BridgeRow
            label={t("TKW zrealizowany")}
            value={formatCurrency(report.realizedUnitCost, 4, lang)}
            strong
            background="bg-(--color-steel-light)"
          />
          <p className="mt-2 text-[10.5px] text-(--color-ink-faint)">
            {t("Odchylenie")} {formatCurrency(report.variance, 4, lang)} × {formatNumber(report.realizedBasis.qGood, 0, lang)}{" "}
            {t("sztuk dobrych")} ={" "}
            <b style={{ color: worse ? "var(--color-status-red)" : "var(--color-status-green)" }}>
              {formatCurrency(report.variance * report.realizedBasis.qGood, 2, lang)}
            </b>{" "}
            {t("wpływu tej szarży na wynik firmy.")}
          </p>
        </div>
      </Section>
    </div>
  );
}

function Headline({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="border-r border-(--color-border) px-4 py-3 last:border-r-0">
      <div className="text-[10px] font-bold uppercase tracking-wide text-(--color-ink-faint)">{label}</div>
      <div className="tabular mt-1 text-[20px] font-bold" style={{ color: color ?? "var(--color-navy)" }}>
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-(--color-border)">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-(--color-navy)">{title}</h3>
        <p className="mt-1 max-w-[980px] text-[11px] text-(--color-ink-soft)">{lead}</p>
      </div>
      {children}
    </section>
  );
}

function BridgeRow({
  label,
  value,
  strong,
  background,
}: {
  label: string;
  value: string;
  strong?: boolean;
  background: string;
}) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 ${background}`}>
      <div className={`text-[12px] uppercase tracking-wide ${strong ? "font-bold text-(--color-navy)" : ""}`}>
        {label}
      </div>
      <div className="tabular text-[15px] font-bold text-(--color-navy)">{value}</div>
    </div>
  );
}

/**
 * Wyjaśnienie statusu szarży: reguła, liczby, które ją uruchomiły, i decyzje,
 * jakie z niej wynikają — razem z przejściem do dokumentów, w których te
 * decyzje się wykonuje.
 */
export function StatusExplainer({ report, onClose }: { report: TkwReport; onClose: () => void }) {
  const t = useT();
  const lang = useLang();
  const open = useOpenSource();
  const chip = statusChip[report.status];
  const margin = report.product.priceZl - report.realizedUnitCost;
  const marginPlanned = report.product.priceZl - report.plannedUnitCost;
  const qGood = report.realizedBasis.qGood;
  const markupPct = computeProductEconomics(report.product).markupPct;
  const suggestedPrice = report.realizedUnitCost * (1 + Math.round(markupPct * 10) / 10 / 100);

  const negativeMargin = margin < 0;
  const bigVariance = report.variancePct > 25;
  const topDriver = [...report.drivers].sort((a, b) => Math.abs(b.total) - Math.abs(a.total))[0];

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const rules: { status: OrderStatus; when: string; means: string }[] = [
    {
      status: "czerwony",
      when: t("marża jednostkowa poniżej zera LUB odchylenie TKW powyżej 25%"),
      means: t("Szarża wymaga decyzji właściciela: ceny, technologii albo warunków z klientem."),
    },
    {
      status: "zolty",
      when: t("odchylenie TKW od 5% do 25% przy dodatniej marży"),
      means: t("Produkcja się broni, ale odchylenie jest na tyle duże, że trzeba je wyjaśnić."),
    },
    {
      status: "zielony",
      when: t("odchylenie TKW poniżej 5% i dodatnia marża"),
      means: t("Realizacja mieści się w założeniach — brak działań."),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[860px] border-2 border-(--color-navy) bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b-2 border-(--color-navy) bg-(--color-navy) px-5 py-4 text-white">
          <div>
            <div className="flex items-center gap-2">
              <Info size={16} />
              <span className="text-[13px] font-bold uppercase tracking-wide">
                {t("Status szarży:")} {t(chip.label)}
              </span>
            </div>
            <div className="mt-1 text-[11.5px] text-white/80">
              {report.batch.id} · {report.product.id} {t(report.product.name)} · {t("szarża zakończona")}{" "}
              {report.batch.finishedAt?.replace("T", " ") ?? "—"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex shrink-0 items-center gap-1 rounded-sm border border-white/40 px-2 py-1 text-[10.5px] font-semibold hover:bg-white/10"
          >
            <X size={12} />
            {t("Zamknij")}
          </button>
        </header>

        <div className="border-b border-(--color-border) px-5 py-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-faint)">
            {t("Dlaczego ta szarża dostała taki status")}
          </h4>
          <div className="mt-2 grid gap-1.5">
            {rules.map((rule) => {
              const active = rule.status === report.status;
              const ruleChip = statusChip[rule.status];
              return (
                <div
                  key={rule.status}
                  className={`grid grid-cols-[150px_1fr] items-start gap-3 border px-3 py-2 ${
                    active ? "border-(--color-navy) bg-(--color-steel-light)" : "border-(--color-border)"
                  }`}
                >
                  <span
                    className={`inline-block rounded-sm px-2 py-1 text-center text-[10.5px] font-bold ${ruleChip.className}`}
                  >
                    {t(ruleChip.label)}
                  </span>
                  <div>
                    <div className="text-[12px] font-semibold text-(--color-ink)">{rule.when}</div>
                    <div className="mt-0.5 text-[11px] text-(--color-ink-soft)">{rule.means}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-b border-(--color-border) px-5 py-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-faint)">
            {t("Liczby, które uruchomiły regułę")}
          </h4>
          <div className="mt-2 grid grid-cols-2 gap-x-6">
            <Figure label={t("Cena sprzedaży wg kartoteki")} value={formatCurrency(report.product.priceZl, 4, lang)} />
            <Figure
              label={t("TKW zrealizowany")}
              value={formatCurrency(report.realizedUnitCost, 4, lang)}
              color={report.variance > 0 ? "var(--color-status-red)" : undefined}
            />
            <Figure
              label={t("Marża jednostkowa w planie")}
              value={formatCurrency(marginPlanned, 4, lang)}
              color={marginPlanned < 0 ? "var(--color-status-red)" : "var(--color-status-green)"}
            />
            <Figure
              label={t("Marża jednostkowa po realizacji")}
              value={formatCurrency(margin, 4, lang)}
              color={margin < 0 ? "var(--color-status-red)" : "var(--color-status-green)"}
              highlight={negativeMargin}
            />
            <Figure
              label={t("Odchylenie TKW")}
              value={`${report.variancePct > 0 ? "+" : "−"}${formatPercent(Math.abs(report.variancePct), 1, lang)}`}
              color={report.variance > 0 ? "var(--color-status-red)" : "var(--color-status-green)"}
              highlight={bigVariance}
            />
            <Figure
              label={`${t("Wynik na szarży")} (${formatNumber(qGood, 0, lang)} ${t("szt.")})`}
              value={formatCurrency(margin * qGood, 2, lang)}
              color={margin < 0 ? "var(--color-status-red)" : "var(--color-status-green)"}
            />
          </div>
          <p className="mt-3 border-l-2 px-3 py-2 text-[11.5px] leading-snug" style={{ borderColor: chip.color }}>
            {report.status === "czerwony" && (
              <>
                {t("Warunek spełniony:")}{" "}
                <b>
                  {negativeMargin && bigVariance
                    ? t("marża jednostkowa jest ujemna i odchylenie TKW przekracza 25%")
                    : negativeMargin
                      ? t("marża jednostkowa jest ujemna — cena sprzedaży nie pokrywa kosztu wytworzenia")
                      : t("odchylenie TKW przekracza 25%")}
                </b>
                . {topDriver && <>{t("Największy pojedynczy powód:")} {topDriver.label.toLowerCase()}.</>}
              </>
            )}
            {report.status === "zolty" && (
              <>
                {t("Warunek spełniony:")} <b>{t("odchylenie TKW mieści się w przedziale 5–25%")}</b>{t(", a marża pozostaje dodatnia.")}{" "}
                {topDriver && <>{t("Do wyjaśnienia przede wszystkim:")} {topDriver.label.toLowerCase()}.</>}
              </>
            )}
            {report.status === "zielony" && (
              <>
                {t("Żaden warunek ostrzegawczy nie został spełniony —")} <b>{t("odchylenie poniżej 5%")}</b>{" "}
                {t("przy dodatniej marży. Szarża potwierdza, że kalkulacja tego wyrobu jest realna.")}
              </>
            )}
          </p>
        </div>

        <div className="px-5 py-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-faint)">
            {report.status === "zielony" ? t("Co można z tym zrobić") : t("Decyzje do podjęcia")}
          </h4>
          <div className="mt-2 grid gap-1.5">
            <Decision
              title={`${t("Sprawdź raport zmianowy")} ${report.batch.shiftReportNumber}`}
              description={`${t("Dane realizacji tej szarży pochodzą z raportu operatora")} ${report.batch.operator}. ${t("Tam widać ilości, cykl i przestoje.")}`}
              onClick={() => {
                open({
                  number: report.batch.shiftReportNumber,
                  title: t("Raport zmianowy"),
                  moduleId: 3,
                  tab: "operator",
                });
                onClose();
              }}
            />
            {(report.realizedBasis.formServiceCostZl > 0 || report.realizedBasis.downtimeH > 0) && (
              <Decision
                title={`${t("Przejrzyj kartę formy")} ${report.batch.moldId}`}
                description={
                  report.realizedBasis.formServiceCostZl > 0
                    ? `${t("Serwis formy obciążył tę szarżę kwotą")} ${formatCurrency(report.realizedBasis.formServiceCostZl, 0, lang)}. ${t("Sprawdź historię awarii i licznik cykli.")}`
                    : `${t("Przestój")} ${formatNumber(report.realizedBasis.downtimeH, 1, lang)} h ${t("wszedł w koszt maszyny i robocizny. Sprawdź, czy przyczyna leży po stronie formy.")}`
                }
                onClick={() => {
                  open({ number: report.batch.moldId, title: t("Karta formy"), moduleId: 5, tab: "formy" });
                  onClose();
                }}
              />
            )}
            {report.status !== "zielony" && (
              <Decision
                title={`${t("Zrewiduj kalkulację")} ${report.product.id} — ${t("cena minimalna")} ${formatCurrency(suggestedPrice, 4, lang)}`}
                description={`${t("Przy dotychczasowym narzucie")} ${formatPercent(markupPct, 1, lang)} ${t("i koszcie")} ${formatCurrency(report.realizedUnitCost, 4, lang)} ${t("to jest cena, która odtwarza założoną marżę. Obecna cena:")} ${formatCurrency(report.product.priceZl, 4, lang)}.`}
                onClick={() => {
                  open({ number: report.product.id, title: t("Kalkulacja"), moduleId: 1, tab: "kalkulacja" });
                  onClose();
                }}
              />
            )}
            <Decision
              title={t("Zobacz pełne rozliczenie kosztu rzeczywistego")}
              description={t("Moduł 3 pokazuje rozliczenie zlecenia dokument po dokumencie — to samo źródło, z którego liczona jest kolumna „TKW zrealizowany”.")}
              onClick={() => {
                open({ number: "RKR", title: t("Rozliczenie kosztu"), moduleId: 3, tab: "koszt" });
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Figure({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: string;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between border-b border-(--color-border) py-2 ${
        highlight ? "bg-[#fff7d6] px-2" : ""
      }`}
    >
      <span className="text-[11.5px] text-(--color-ink-soft)">{label}</span>
      <span className="tabular text-[14px] font-bold" style={{ color: color ?? "var(--color-navy)" }}>
        {value}
      </span>
    </div>
  );
}

function Decision({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 border border-(--color-border) bg-white px-3 py-2.5 text-left hover:border-(--color-steel) hover:bg-(--color-steel-light)"
    >
      <ArrowRight size={14} className="mt-0.5 shrink-0 text-(--color-steel)" />
      <span>
        <span className="block text-[12px] font-semibold text-(--color-navy)">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-(--color-ink-soft)">{description}</span>
      </span>
    </button>
  );
}
