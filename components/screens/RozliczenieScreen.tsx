"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useDemoStore } from "@/store/useDemoStore";
import { productionOrders } from "@/lib/seed-data";
import { computeOrderSettlement, formatCurrency, formatNumber, formatPercent } from "@/lib/calculations";
import { StatusDot } from "@/components/StatusDot";
import { WaterfallChart } from "@/components/WaterfallChart";
import type { OrderStatus } from "@/lib/types";
import { useT } from "@/lib/use-t";

const STATUS_LABEL: Record<OrderStatus, string> = {
  zielony: "ZIELONY",
  zolty: "ŻÓŁTY",
  czerwony: "CZERWONY",
};

const ANNUAL_RUNS = 12;

export function RozliczenieScreen() {
  const t = useT();
  const selectedOrderId = useDemoStore((s) => s.selectedOrderId);
  const setSelectedOrder = useDemoStore((s) => s.setSelectedOrder);
  const revealed = useDemoStore((s) => s.suggestedPriceRevealed);
  const revealSuggestedPrice = useDemoStore((s) => s.revealSuggestedPrice);

  const settlement = computeOrderSettlement(
    productionOrders.find((o) => o.id === selectedOrderId) ?? productionOrders[0]
  );
  const { order, product, calc, actualUnitCost, deviationPct, resultPerUnit, resultTotal, status, waterfall } =
    settlement;

  const isBelowCost = resultPerUnit < 0;
  // Rounded to whole zł before differencing, so the printed "różnica" always
  // equals what a reader gets by subtracting the two printed totals by hand.
  const plannedAnnual = Math.round(calc.margin * order.goodQty * ANNUAL_RUNS);
  const actualAnnual = Math.round(resultPerUnit * order.goodQty * ANNUAL_RUNS);
  const annualDiff = plannedAnnual - actualAnnual;

  const priceRevealed = !!revealed[order.id];

  return (
    <div className="grid grid-cols-[260px_1fr] gap-0">
      <aside className="border-r border-(--color-border) bg-(--color-card)">
        <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-faint)">
          {t("Zakończone zlecenia")}
        </div>
        <ul className="flex flex-col gap-0.5 px-2 pb-4">
          {productionOrders.map((o) => {
            const s = computeOrderSettlement(o);
            const active = o.id === selectedOrderId;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(o.id)}
                  className={`flex w-full flex-col gap-1 rounded-sm border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-(--color-steel) bg-(--color-steel-light)"
                      : "border-transparent hover:border-(--color-border-strong)"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StatusDot status={s.status} />
                    <span className="tabular text-[12.5px] font-medium text-(--color-ink)">{o.id}</span>
                  </div>
                  <span className="text-[12px] text-(--color-ink-soft)">{s.product.name}</span>
                  <span className="tabular text-[11.5px] text-(--color-ink-faint)">
                    odchylenie {s.deviationPct >= 0 ? "+" : ""}
                    {formatPercent(s.deviationPct)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="tabular text-[13px] font-medium text-(--color-ink-soft)">
              {order.id} &middot; {product.name}
            </div>
            <div className="text-[12px] text-(--color-ink-faint)">
              zlecono {formatNumber(order.orderedQty, 0)} szt. &middot; wyprodukowano dobrych{" "}
              {formatNumber(order.goodQty, 0)} szt.
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-sm border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide"
            style={{
              borderColor:
                status === "czerwony"
                  ? "var(--color-status-red)"
                  : status === "zolty"
                  ? "var(--color-status-amber)"
                  : "var(--color-status-green)",
              color:
                status === "czerwony"
                  ? "var(--color-status-red)"
                  : status === "zolty"
                  ? "var(--color-status-amber)"
                  : "var(--color-status-green)",
              background:
                status === "czerwony"
                  ? "var(--color-status-red-bg)"
                  : status === "zolty"
                  ? "var(--color-status-amber-bg)"
                  : "var(--color-status-green-bg)",
            }}
          >
            <StatusDot status={status} />
            STATUS: {STATUS_LABEL[status]}
          </div>
        </div>

        {/* Three tiles */}
        <div className="grid grid-cols-3 gap-4">
          <Tile label="Kalkulacja" value={formatCurrency(calc.unitCost, 4)} />
          <Tile label="Koszt rzeczywisty" value={formatCurrency(actualUnitCost, 4)} accent />
          <Tile
            label="Cena dla Klienta"
            value={formatCurrency(product.priceZl, 4)}
            danger={isBelowCost}
            footnote={isBelowCost ? "Sprzedajesz poniżej kosztu wytworzenia" : undefined}
          />
        </div>

        {/* Waterfall */}
        <div className="rounded-sm border border-(--color-border) bg-(--color-card) p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-(--color-ink)">
              {t("Rozkład odchylenia: kalkulacja → rzeczywistość")}
            </h2>
            <span className="tabular text-[12.5px] font-semibold" style={{ color: "var(--color-status-red)" }}>
              odchylenie {deviationPct >= 0 ? "+" : ""}
              {formatPercent(deviationPct)}
            </span>
          </div>
          <WaterfallChart baseline={calc.unitCost} steps={waterfall} total={actualUnitCost - calc.unitCost} />
          <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 border-t border-(--color-border) pt-3 text-[12.5px] sm:grid-cols-2">
            {waterfall.map((step) => (
              <div key={step.label} className="flex items-center justify-between gap-3">
                <span className="text-(--color-ink-soft)">{step.label}</span>
                <span
                  className="tabular font-medium"
                  style={{ color: step.impact >= 0 ? "var(--color-status-red)" : "var(--color-status-green)" }}
                >
                  {step.impact >= 0 ? "+" : ""}
                  {formatNumber(step.impact, 4)}
                </span>
              </div>
            ))}
            <div className="col-span-full mt-1 flex items-center justify-between border-t border-(--color-border) pt-2 font-semibold text-(--color-ink)">
              <span>Razem odchylenie</span>
              <span className="tabular">
                {actualUnitCost - calc.unitCost >= 0 ? "+" : ""}
                {formatCurrency(actualUnitCost - calc.unitCost, 4)} ({deviationPct >= 0 ? "+" : ""}
                {formatPercent(deviationPct)})
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-[1fr_auto] items-stretch gap-4">
          <div className="rounded-sm border border-(--color-border) bg-(--color-card) p-5">
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-(--color-ink-soft)">Wynik na tym zleceniu</span>
                <span
                  className="tabular text-[16px] font-semibold"
                  style={{ color: resultTotal < 0 ? "var(--color-status-red)" : "var(--color-status-green)" }}
                >
                  {resultTotal >= 0 ? "+" : ""}
                  {formatCurrency(resultTotal, 2)}
                </span>
              </div>
              <div className="border-t border-(--color-border) pt-3">
                <div className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-(--color-ink-faint)">
                  Wpływ roczny przy {ANNUAL_RUNS} produkcjach
                </div>
                <div className="flex items-baseline gap-2 text-[13px] text-(--color-ink-soft)">
                  <span>planowano</span>
                  <span className="tabular font-medium text-(--color-ink)">
                    {plannedAnnual >= 0 ? "+" : ""}
                    {formatCurrency(plannedAnnual, 0)}
                  </span>
                  <span>&middot; faktycznie</span>
                  <span
                    className="tabular font-medium"
                    style={{ color: actualAnnual < 0 ? "var(--color-status-red)" : "var(--color-ink)" }}
                  >
                    {actualAnnual >= 0 ? "+" : ""}
                    {formatCurrency(actualAnnual, 0)}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[13px] text-(--color-ink-soft)">{t("Różnica:")}</span>
                  <span className="tabular text-[26px] font-bold leading-none text-(--color-navy)">
                    {formatCurrency(Math.abs(annualDiff), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <RefreshPricePanel
            orderId={order.id}
            currentPrice={product.priceZl}
            suggestedPrice={settlement.suggestedNewPrice}
            revealed={priceRevealed}
            onReveal={() => revealSuggestedPrice(order.id)}
          />
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
  danger,
  footnote,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
  footnote?: string;
}) {
  return (
    <div
      className={`rounded-sm border bg-(--color-card) p-4 ${
        danger ? "border-2" : "border border-(--color-border)"
      }`}
      style={danger ? { borderColor: "var(--color-status-red)", background: "var(--color-status-red-bg)" } : undefined}
    >
      <div className="text-[12px] font-medium uppercase tracking-wide text-(--color-ink-faint)">{label}</div>
      <div
        className="tabular mt-1.5 text-[26px] font-bold leading-none"
        style={{ color: danger ? "var(--color-status-red)" : accent ? "var(--color-navy)" : "var(--color-ink)" }}
      >
        {value}
      </div>
      {footnote && (
        <div className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "var(--color-status-red)" }}>
          <AlertTriangle size={13} />
          {footnote}
        </div>
      )}
    </div>
  );
}

function RefreshPricePanel({
  orderId,
  currentPrice,
  suggestedPrice,
  revealed,
  onReveal,
}: {
  orderId: string;
  currentPrice: number;
  suggestedPrice: number;
  revealed: boolean;
  onReveal: () => void;
}) {
  const t = useT();
  const pctDiff = ((suggestedPrice - currentPrice) / currentPrice) * 100;
  return (
    <div className="flex w-64 flex-col justify-between gap-3 rounded-sm border border-(--color-border) bg-(--color-card) p-5">
      <div>
        <div className="text-[12px] font-medium uppercase tracking-wide text-(--color-ink-faint)">
          Sugerowana cena
        </div>
        {revealed ? (
          <>
            <div className="tabular mt-1.5 text-[24px] font-bold leading-none text-(--color-navy)">
              {formatCurrency(suggestedPrice, 4)}
            </div>
            <div className="tabular mt-2 text-[12.5px] font-semibold" style={{ color: "var(--color-status-red)" }}>
              {pctDiff >= 0 ? "+" : ""}
              {formatPercent(pctDiff)} względem obecnej ceny dla Klienta
            </div>
          </>
        ) : (
          <div className="mt-1.5 text-[12.5px] text-(--color-ink-soft)">
            {t("Przelicz cenę tak, aby odtworzyć założony narzut na bazie kosztu rzeczywistego.")}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onReveal}
        className="flex items-center justify-center gap-2 rounded-sm bg-(--color-navy) px-3 py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-(--color-navy-dark)"
      >
        <RefreshCw size={14} />
        {t("Odśwież kalkulację na podstawie danych rzeczywistych")}
      </button>
      <div className="text-[10.5px] text-(--color-ink-faint)">zlecenie {orderId}</div>
    </div>
  );
}
