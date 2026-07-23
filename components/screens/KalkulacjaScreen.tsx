"use client";

import { useDemoStore } from "@/store/useDemoStore";
import { products } from "@/lib/seed-data";
import {
  computeProductEconomics,
  applyPlasticPriceChange,
  sliderStatus,
  getMaterial,
  getMachine,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/calculations";

export function KalkulacjaScreen() {
  const selectedProductId = useDemoStore((s) => s.selectedProductId);
  const setSelectedProduct = useDemoStore((s) => s.setSelectedProduct);
  const pct = useDemoStore((s) => s.plasticPriceChangePct);
  const setPct = useDemoStore((s) => s.setPlasticPriceChangePct);
  const applyToAll = useDemoStore((s) => s.applyToAllProducts);
  const setApplyToAll = useDemoStore((s) => s.setApplyToAllProducts);
  const setScreen = useDemoStore((s) => s.setScreen);

  const product = products.find((p) => p.id === selectedProductId) ?? products[0];
  const overrides = { materialPriceOverrides: applyPlasticPriceChange(pct) };
  const econ = computeProductEconomics(product, overrides);
  const direct = econ.direct;
  const baseEcon = computeProductEconomics(product);
  const machine = getMachine(product.machineId);
  const colorant = getMaterial(product.colorantId);
  const { status, message } = sliderStatus(pct);

  const statusStyle = {
    zielony: { color: "var(--color-status-green)", bg: "var(--color-status-green-bg)" },
    zolty: { color: "var(--color-status-amber)", bg: "var(--color-status-amber-bg)" },
    czerwony: { color: "var(--color-status-red)", bg: "var(--color-status-red-bg)" },
  }[status];

  const scrapAddon = econ.unitCost - direct.total;
  const materialPct = (direct.materialCost / econ.unitCost) * 100;
  const colorantPct = (direct.colorantCost / econ.unitCost) * 100;
  const machinePct = (direct.machineCost / econ.unitCost) * 100;
  const scrapPct = (scrapAddon / econ.unitCost) * 100;

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* product tabs */}
      <div className="flex gap-1 border-b border-(--color-border) pb-2">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedProduct(p.id)}
            className={`rounded-sm px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
              p.id === product.id
                ? "bg-(--color-navy) text-white"
                : "text-(--color-ink-soft) hover:bg-(--color-steel-light)"
            }`}
          >
            {p.id}
          </button>
        ))}
      </div>

      <div className="tabular text-[13px] text-(--color-ink-soft)">{product.name}</div>

      <div className="grid grid-cols-[280px_1fr_260px] gap-4">
        {/* LEFT: dane techniczne */}
        <div className="flex flex-col gap-3 rounded-sm border border-(--color-border) bg-(--color-card) p-4">
          <SectionTitle>Dane techniczne</SectionTitle>
          <FieldRow label="Waga netto" value={`${formatNumber(product.weightNetG, 1)} g`} />
          <FieldRow label="Waga brutto" value={`${formatNumber(product.weightGrossG, 1)} g`} />
          <FieldRow label="Krotność formy" value={`${product.cavities}`} />
          <FieldRow label="Czas cyklu" value={`${product.cycleTimeS} s`} />
          <FieldRow label="Wtryskarka" value={`${machine.name}`} />
          <FieldRow label="Stawka maszyny" value={formatCurrency(machine.rateZlH, 2) + "/h"} />

          <div className="mt-1 border-t border-(--color-border) pt-2">
            <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-wide text-(--color-ink-faint)">
              Receptura
            </div>
            {product.recipe.map((c) => {
              const m = getMaterial(c.materialId);
              return (
                <div key={c.materialId} className="flex items-center justify-between py-0.5 text-[12.5px]">
                  <span className="text-(--color-ink-soft)">
                    {m.symbol} ({formatNumber(c.share * 100, 0)}%)
                  </span>
                  <span className="tabular">{formatCurrency(m.priceZlKg, 2)}/kg</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-(--color-border) pt-2">
            <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-wide text-(--color-ink-faint)">
              Barwnik
            </div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-(--color-ink-soft)">
                {colorant.symbol} (dozow. {formatNumber(product.colorantDosagePct, 1)}%)
              </span>
              <span className="tabular">{formatCurrency(colorant.priceZlKg, 2)}/kg</span>
            </div>
          </div>

          <div className="border-t border-(--color-border) pt-2">
            <FieldRow label="Brakowość zakładana" value={formatPercent(product.scrapRatePct)} />
          </div>
        </div>

        {/* MIDDLE: rozbicie kosztu + suwak */}
        <div className="flex flex-col gap-4 rounded-sm border border-(--color-border) bg-(--color-card) p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <SectionTitle>Zmiana cen tworzyw</SectionTitle>
              <span className="tabular text-[15px] font-bold text-(--color-navy)">
                {pct >= 0 ? "+" : ""}
                {pct}%
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={40}
              step={1}
              value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
              className="w-full accent-[#2E74B5]"
            />
            <div className="mt-1 flex justify-between text-[10.5px] text-(--color-ink-faint)">
              <span>-20%</span>
              <span>0%</span>
              <span>+40%</span>
            </div>

            <div
              className="mt-3 flex items-center justify-between rounded-sm px-3 py-2 text-[12.5px] font-semibold"
              style={{ color: statusStyle.color, background: statusStyle.bg }}
            >
              <span>{message}</span>
            </div>

            <label className="mt-2 flex items-center gap-2 text-[12px] text-(--color-ink-soft)">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setApplyToAll(checked);
                  if (checked) setScreen(1);
                }}
                className="h-3.5 w-3.5 accent-[#1F3864]"
              />
              Zastosuj do wszystkich produktów
            </label>
          </div>

          <div className="border-t border-(--color-border) pt-3">
            <SectionTitle>Rozbicie kosztu jednostkowego</SectionTitle>
            <div className="mt-2 flex h-7 w-full overflow-hidden rounded-sm border border-(--color-border-strong)">
              <div style={{ width: `${materialPct}%`, background: "var(--color-navy)" }} title="materiał" />
              <div style={{ width: `${colorantPct}%`, background: "var(--color-steel)" }} title="barwnik" />
              <div style={{ width: `${machinePct}%`, background: "#7A9EC2" }} title="maszyna" />
              <div
                style={{
                  width: `${scrapPct}%`,
                  background: "repeating-linear-gradient(45deg, var(--color-status-amber), var(--color-status-amber) 4px, #fff2 4px, #fff2 8px)",
                }}
                title="narzut na braki"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-(--color-ink-soft)">
              <Legend swatch="var(--color-navy)" label="materiał" />
              <Legend swatch="var(--color-steel)" label="barwnik" />
              <Legend swatch="#7A9EC2" label="maszyna" />
              <Legend swatch="var(--color-status-amber)" label="narzut na braki" hatched />
            </div>

            <table className="mt-3 w-full text-[12.5px]">
              <tbody>
                <CostRow label="Materiał" value={direct.materialCost} />
                <CostRow label="Barwnik" value={direct.colorantCost} />
                <CostRow label="Maszyna" value={direct.machineCost} />
                <CostRow label="Razem koszt bezpośredni" value={direct.total} bold />
                <CostRow label="Narzut na braki" value={scrapAddon} />
                <CostRow label="Koszt jednostkowy" value={econ.unitCost} bold accent />
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: wynik */}
        <div className="flex flex-col gap-3 rounded-sm border border-(--color-border) bg-(--color-card) p-4">
          <SectionTitle>Wynik</SectionTitle>
          <ResultRow label="Koszt jednostkowy" value={formatCurrency(econ.unitCost, 4)} />
          <ResultRow label="Cena sprzedaży" value={formatCurrency(product.priceZl, 4)} />
          <ResultRow
            label="Marża jednostkowa"
            value={formatCurrency(econ.margin, 4)}
            danger={econ.margin < 0}
          />
          <ResultRow label="Narzut %" value={formatPercent(econ.markupPct)} danger={econ.markupPct < 0} />
          <ResultRow label="Wydajność" value={`${formatNumber(econ.hourlyOutput, 1)} /h`} />

          <div className="mt-2 rounded-sm border-2 p-4" style={{ borderColor: "var(--color-navy)" }}>
            <div className="text-[11.5px] font-semibold uppercase tracking-wide text-(--color-ink-faint)">
              Marża na maszynogodzinę
            </div>
            <div
              className="tabular mt-1 text-[36px] font-bold leading-none"
              style={{ color: econ.marginPerMachineHour < 0 ? "var(--color-status-red)" : "var(--color-navy)" }}
            >
              {formatNumber(econ.marginPerMachineHour, 1)}
              <span className="ml-1 text-[16px] font-medium text-(--color-ink-faint)">zł/h</span>
            </div>
            {pct !== 0 && (
              <div className="tabular mt-1 text-[11.5px] text-(--color-ink-faint)">
                bazowo: {formatNumber(baseEcon.marginPerMachineHour, 1)} zł/h
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] font-semibold uppercase tracking-wide text-(--color-ink)">{children}</div>;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className="text-(--color-ink-soft)">{label}</span>
      <span className="tabular font-medium">{value}</span>
    </div>
  );
}

function Legend({ swatch, label, hatched }: { swatch: string; label: string; hatched?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-[1px]"
        style={{
          background: hatched
            ? `repeating-linear-gradient(45deg, ${swatch}, ${swatch} 2px, #fff2 2px, #fff2 4px)`
            : swatch,
        }}
      />
      {label}
    </span>
  );
}

function CostRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: number;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <tr className={bold ? "border-t border-(--color-border)" : undefined}>
      <td className={`py-1 ${bold ? "font-semibold" : "text-(--color-ink-soft)"}`}>{label}</td>
      <td
        className={`tabular py-1 text-right ${bold ? "font-semibold" : ""}`}
        style={accent ? { color: "var(--color-navy)" } : undefined}
      >
        {formatCurrency(value, 4)}
      </td>
    </tr>
  );
}

function ResultRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-(--color-ink-soft)">{label}</span>
      <span
        className="tabular font-semibold"
        style={danger ? { color: "var(--color-status-red)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
