"use client";

import { useDemoStore } from "@/store/useDemoStore";
import { productionOrders, operators } from "@/lib/seed-data";
import { getProduct, hourlyOutput, formatNumber, formatPercent } from "@/lib/calculations";
import type { WorkMode } from "@/lib/types";

const WORK_MODES: { id: WorkMode; label: string }[] = [
  { id: "produkcja", label: "Praca ciągła" },
  { id: "przezbrojenie", label: "Przezbrojenie na zmianie" },
  { id: "przestoj", label: "Przestoje" },
];

export function RaportZmianowyScreen() {
  const activeOrderId = useDemoStore((s) => s.activeReportOrderId);
  const setActiveOrderId = useDemoStore((s) => s.setActiveReportOrderId);
  const shiftForms = useDemoStore((s) => s.shiftForms);
  const updateShiftForm = useDemoStore((s) => s.updateShiftForm);
  const updateColorCount = useDemoStore((s) => s.updateColorCount);
  const updateSingleCount = useDemoStore((s) => s.updateSingleCount);
  const submitShiftReport = useDemoStore((s) => s.submitShiftReport);
  const lastSubmitConfirmation = useDemoStore((s) => s.lastSubmitConfirmation);
  const productionProgress = useDemoStore((s) => s.productionProgress);

  const order = productionOrders.find((o) => o.id === activeOrderId) ?? productionOrders[0];
  const product = getProduct(order.productId);
  const form = shiftForms[order.id];
  const progress = productionProgress[order.id] ?? { producedGood: 0, producedBad: 0 };

  if (!form) return null;

  const totalProduced = progress.producedGood + progress.producedBad;
  const progressPct = Math.min(100, (progress.producedGood / order.orderedQty) * 100);
  const scrapSoFar = totalProduced > 0 ? (progress.producedBad / totalProduced) * 100 : 0;
  const remaining = Math.max(0, order.orderedQty - progress.producedGood);
  const hOutput = hourlyOutput(product, form.cycleTimeInput || product.cycleTimeS);
  const etaHours = hOutput > 0 ? remaining / hOutput : 0;

  return (
    <div className="grid grid-cols-[minmax(0,900px)_260px] justify-center gap-4 p-6">
      <div className="min-w-0">
        {/* header */}
        <div className="mb-5 rounded-sm border border-(--color-border) bg-(--color-card) p-4">
          <div className="mb-3 flex items-center gap-3">
            <select
              value={activeOrderId}
              onChange={(e) => setActiveOrderId(e.target.value)}
              className="h-14 flex-1 rounded-sm border border-(--color-border-strong) bg-white px-3 text-[16px] font-semibold"
            >
              {productionOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} &middot; {getProduct(o.productId).name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="mb-1 text-[12px] font-medium text-(--color-ink-faint)">Data</div>
              <div className="tabular flex h-12 items-center rounded-sm border border-(--color-border) bg-(--color-bg) px-3 text-[15px] font-medium">
                {order.date}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[12px] font-medium text-(--color-ink-faint)">Zmiana</div>
              <div className="flex h-12 gap-1">
                {(["I", "II", "III"] as const).map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => updateShiftForm(order.id, { shift: sh })}
                    className={`flex-1 rounded-sm border text-[15px] font-semibold transition-colors ${
                      form.shift === sh
                        ? "border-(--color-navy) bg-(--color-navy) text-white"
                        : "border-(--color-border-strong) bg-white text-(--color-ink-soft)"
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[12px] font-medium text-(--color-ink-faint)">Operator</div>
              <select
                value={form.operator}
                onChange={(e) => updateShiftForm(order.id, { operator: e.target.value })}
                className="h-12 w-full rounded-sm border border-(--color-border-strong) bg-white px-3 text-[15px] font-medium"
              >
                {operators.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* production counts */}
        <div className="mb-5 flex flex-col gap-2 rounded-sm border border-(--color-border) bg-(--color-card) p-4">
          <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-(--color-ink-faint)">
            Produkcja tej zmiany
          </div>
          {product.colors ? (
            product.colors.map((color) => (
              <ColorCountRow
                key={color}
                label={color}
                count={form.colorCounts[color] ?? { good: 0, bad: 0 }}
                onChange={(field, delta) => updateColorCount(order.id, color, field, delta)}
              />
            ))
          ) : (
            <ColorCountRow
              label={product.name}
              count={form.singleCount}
              onChange={(field, delta) => updateSingleCount(order.id, field, delta)}
            />
          )}
        </div>

        {/* cycle / work mode / notes */}
        <div className="mb-5 flex flex-col gap-4 rounded-sm border border-(--color-border) bg-(--color-card) p-4">
          <div>
            <div className="mb-1 text-[13px] font-medium text-(--color-ink-soft)">Czas cyklu odczytany z panelu [s]</div>
            <input
              type="number"
              value={form.cycleTimeInput}
              onChange={(e) => updateShiftForm(order.id, { cycleTimeInput: Number(e.target.value) })}
              className="tabular h-14 w-40 rounded-sm border border-(--color-border-strong) bg-white px-3 text-[18px] font-semibold"
            />
          </div>

          <div>
            <div className="mb-1 text-[13px] font-medium text-(--color-ink-soft)">Charakter pracy</div>
            <div className="flex gap-2">
              {WORK_MODES.map((wm) => (
                <button
                  key={wm.id}
                  type="button"
                  onClick={() => updateShiftForm(order.id, { workMode: wm.id })}
                  className={`h-14 flex-1 rounded-sm border text-[14.5px] font-semibold transition-colors ${
                    form.workMode === wm.id
                      ? "border-(--color-steel) bg-(--color-steel) text-white"
                      : "border-(--color-border-strong) bg-white text-(--color-ink-soft)"
                  }`}
                >
                  {wm.label}
                </button>
              ))}
            </div>
            {form.workMode === "przezbrojenie" && (
              <div className="mt-3">
                <div className="mb-1 text-[13px] font-medium text-(--color-ink-soft)">Liczba godzin przezbrojenia</div>
                <input
                  type="number"
                  step={0.5}
                  value={form.setupHours}
                  onChange={(e) => updateShiftForm(order.id, { setupHours: Number(e.target.value) })}
                  className="tabular h-14 w-40 rounded-sm border border-(--color-border-strong) bg-white px-3 text-[18px] font-semibold"
                />
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 text-[13px] font-medium text-(--color-ink-soft)">Uwagi</div>
            <textarea
              value={form.notes}
              onChange={(e) => updateShiftForm(order.id, { notes: e.target.value })}
              rows={2}
              className="w-full rounded-sm border border-(--color-border-strong) bg-white px-3 py-2 text-[14px]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => submitShiftReport(order.id)}
          className="h-16 w-full rounded-sm bg-(--color-navy) text-[18px] font-bold text-white transition-colors hover:bg-(--color-navy-dark)"
        >
          Zatwierdź raport zmiany
        </button>

        {lastSubmitConfirmation && (
          <div className="mt-3 rounded-sm border border-(--color-status-green) bg-(--color-status-green-bg) px-4 py-3 text-[14px] font-medium" style={{ color: "var(--color-status-green)" }}>
            {lastSubmitConfirmation}
          </div>
        )}
      </div>

      {/* progress panel */}
      <div className="min-w-0">
        <div className="sticky top-6 flex flex-col gap-4 rounded-sm border border-(--color-border) bg-(--color-card) p-4">
          <div className="text-[13px] font-semibold uppercase tracking-wide text-(--color-ink-faint)">
            Postęp zlecenia {order.id}
          </div>
          <div>
            <div className="tabular text-[26px] font-bold leading-none text-(--color-navy)">
              {formatNumber(progress.producedGood, 0)}
              <span className="text-[16px] font-medium text-(--color-ink-faint)"> / {formatNumber(order.orderedQty, 0)}</span>
            </div>
            <div className="mt-2 h-3 w-full rounded-sm bg-(--color-steel-light)">
              <div
                className="h-3 rounded-sm bg-(--color-steel)"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 border-t border-(--color-border) pt-3 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-(--color-ink-soft)">Brakowość narastająco</span>
              <span className="tabular font-semibold">{formatPercent(scrapSoFar)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-ink-soft)">Wadliwe dotychczas</span>
              <span className="tabular font-semibold">{formatNumber(progress.producedBad, 0)} szt.</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-ink-soft)">Pozostało do zrobienia</span>
              <span className="tabular font-semibold">{formatNumber(remaining, 0)} szt.</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-ink-soft)">Szac. czas do zakończenia</span>
              <span className="tabular font-semibold">{formatNumber(etaHours, 1)} h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorCountRow({
  label,
  count,
  onChange,
}: {
  label: string;
  count: { good: number; bad: number };
  onChange: (field: "good" | "bad", delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-(--color-border) py-2 last:border-0">
      <div className="w-32 shrink-0 text-[14px] font-medium capitalize">{label}</div>
      <CounterField label="dobre" value={count.good} onChange={(d) => onChange("good", d)} />
      <CounterField label="wadliwe" value={count.bad} onChange={(d) => onChange("bad", d)} danger />
    </div>
  );
}

function CounterField({
  label,
  value,
  onChange,
  danger,
}: {
  label: string;
  value: number;
  onChange: (delta: number) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <span className="w-16 text-[12.5px] text-(--color-ink-faint)">{label}</span>
      <button
        type="button"
        onClick={() => onChange(-100)}
        className="h-14 w-14 shrink-0 rounded-sm border border-(--color-border-strong) bg-white text-[13px] font-bold text-(--color-ink-soft) active:bg-(--color-steel-light)"
      >
        -100
      </button>
      <button
        type="button"
        onClick={() => onChange(-10)}
        className="h-14 w-14 shrink-0 rounded-sm border border-(--color-border-strong) bg-white text-[13px] font-bold text-(--color-ink-soft) active:bg-(--color-steel-light)"
      >
        -10
      </button>
      <div
        className="tabular flex h-14 w-20 shrink-0 items-center justify-center rounded-sm border text-[18px] font-bold"
        style={{
          borderColor: danger ? "var(--color-status-red)" : "var(--color-border-strong)",
          color: danger ? "var(--color-status-red)" : "var(--color-ink)",
        }}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(10)}
        className="h-14 w-14 shrink-0 rounded-sm border border-(--color-border-strong) bg-white text-[13px] font-bold text-(--color-ink-soft) active:bg-(--color-steel-light)"
      >
        +10
      </button>
      <button
        type="button"
        onClick={() => onChange(100)}
        className="h-14 w-14 shrink-0 rounded-sm border border-(--color-border-strong) bg-white text-[13px] font-bold text-(--color-ink-soft) active:bg-(--color-steel-light)"
      >
        +100
      </button>
    </div>
  );
}
