"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { products } from "@/lib/seed-data";
import { computeProductEconomics, formatNumber, formatPercent } from "@/lib/calculations";

const ROW_H = 46;
const HIGHLIGHT_IDS = new Set(["P-104", "P-101"]);

export function RentownoscScreen() {
  const rows = products.map((p) => {
    const econ = computeProductEconomics(p);
    return { product: p, markupPct: econ.markupPct, marginH: econ.marginPerMachineHour };
  });

  const byMarkup = [...rows].sort((a, b) => b.markupPct - a.markupPct);
  const byMarginH = [...rows].sort((a, b) => b.marginH - a.marginH);

  const rankMarkup = new Map(byMarkup.map((r, i) => [r.product.id, i]));
  const rankMarginH = new Map(byMarginH.map((r, i) => [r.product.id, i]));

  const maxMarkup = Math.max(...rows.map((r) => r.markupPct));
  const maxMarginH = Math.max(...rows.map((r) => r.marginH));

  const height = ROW_H * rows.length;

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="grid grid-cols-[1fr_90px_1fr] gap-0">
        <div>
          <h2 className="mb-3 text-[13px] font-semibold text-(--color-ink)">Ranking wg narzutu %</h2>
          <div style={{ height }} className="relative">
            {byMarkup.map((r, i) => (
              <BarRow
                key={r.product.id}
                top={i * ROW_H}
                rank={i + 1}
                id={r.product.id}
                name={r.product.name}
                value={formatPercent(r.markupPct)}
                widthPct={(r.markupPct / maxMarkup) * 100}
                highlighted={HIGHLIGHT_IDS.has(r.product.id)}
                align="left"
              />
            ))}
          </div>
        </div>

        <div className="relative" style={{ height }}>
          <svg width="100%" height={height} className="absolute inset-0 overflow-visible">
            {rows.map((r) => {
              const y1 = (rankMarkup.get(r.product.id) ?? 0) * ROW_H + ROW_H / 2;
              const y2 = (rankMarginH.get(r.product.id) ?? 0) * ROW_H + ROW_H / 2;
              const highlighted = HIGHLIGHT_IDS.has(r.product.id);
              return (
                <line
                  key={r.product.id}
                  x1={0}
                  y1={y1}
                  x2={90}
                  y2={y2}
                  stroke={highlighted ? "var(--color-navy)" : "var(--color-border-strong)"}
                  strokeWidth={highlighted ? 2 : 1}
                  strokeDasharray={highlighted ? undefined : "3 3"}
                />
              );
            })}
          </svg>
        </div>

        <div>
          <h2 className="mb-3 text-right text-[13px] font-semibold text-(--color-ink)">
            Ranking wg marży na maszynogodzinę
          </h2>
          <div style={{ height }} className="relative">
            {byMarginH.map((r, i) => (
              <BarRow
                key={r.product.id}
                top={i * ROW_H}
                rank={i + 1}
                id={r.product.id}
                name={r.product.name}
                value={`${formatNumber(r.marginH, 1)} zł/h`}
                widthPct={(r.marginH / maxMarginH) * 100}
                highlighted={HIGHLIGHT_IDS.has(r.product.id)}
                align="right"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-sm border border-(--color-border) bg-(--color-card) p-4">
        {rows
          .filter((r) => HIGHLIGHT_IDS.has(r.product.id))
          .map((r) => {
            const rm = (rankMarkup.get(r.product.id) ?? 0) + 1;
            const rh = (rankMarginH.get(r.product.id) ?? 0) + 1;
            const delta = rm - rh;
            return (
              <div key={r.product.id} className="flex items-center gap-2 text-[13px]">
                <span className="font-semibold text-(--color-ink)">
                  {r.product.name} ({r.product.id})
                </span>
                <span className="text-(--color-ink-soft)">
                  — miejsce {rm} wg narzutu, miejsce {rh} wg marży na maszynogodzinę
                </span>
                <span
                  className="tabular flex items-center gap-0.5 font-semibold"
                  style={{ color: delta > 0 ? "var(--color-status-green)" : "var(--color-status-red)" }}
                >
                  {delta > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {Math.abs(delta)}
                </span>
              </div>
            );
          })}
      </div>

      <p className="text-center text-[14px] italic text-(--color-ink-soft)">
        Przy ograniczonym czasie maszyn to druga miara decyduje o wyniku firmy.
      </p>
    </div>
  );
}

function BarRow({
  top,
  rank,
  id,
  name,
  value,
  widthPct,
  highlighted,
  align,
}: {
  top: number;
  rank: number;
  id: string;
  name: string;
  value: string;
  widthPct: number;
  highlighted: boolean;
  align: "left" | "right";
}) {
  const barColor = highlighted ? "var(--color-navy)" : "var(--color-steel)";
  return (
    <div className="absolute inset-x-0 flex items-center" style={{ top, height: ROW_H }}>
      {align === "left" ? (
        <div className="flex w-full flex-col gap-1 pr-2">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className={`tabular ${highlighted ? "font-semibold text-(--color-navy)" : "text-(--color-ink-soft)"}`}>
              #{rank} {id} · {name}
            </span>
            <span className="tabular font-semibold">{value}</span>
          </div>
          <div className="h-3 w-full rounded-sm bg-(--color-steel-light)">
            <div className="h-3 rounded-sm" style={{ width: `${widthPct}%`, background: barColor }} />
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-1 pl-2">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="tabular font-semibold">{value}</span>
            <span className={`tabular ${highlighted ? "font-semibold text-(--color-navy)" : "text-(--color-ink-soft)"}`}>
              {id} · {name} #{rank}
            </span>
          </div>
          <div className="flex h-3 w-full justify-end rounded-sm bg-(--color-steel-light)">
            <div className="h-3 rounded-sm" style={{ width: `${widthPct}%`, background: barColor }} />
          </div>
        </div>
      )}
    </div>
  );
}
