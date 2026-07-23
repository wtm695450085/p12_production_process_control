"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, AlertTriangle } from "lucide-react";
import { useDemoStore } from "@/store/useDemoStore";
import { products, productionOrders } from "@/lib/seed-data";
import {
  computeProductEconomics,
  computeOrderSettlement,
  applyPlasticPriceChange,
  sliderStatus,
  getMaterial,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/calculations";
import { StatusDot } from "@/components/StatusDot";
import type { OrderStatus, Product } from "@/lib/types";

type SortKey = "name" | "cavities" | "cycleTimeS" | "priceZl" | "unitCost" | "markupPct" | "marginPerMachineHour";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Nazwa" },
  { key: "cavities", label: "Krotność" },
  { key: "cycleTimeS", label: "Cykl [s]" },
  { key: "priceZl", label: "Cena" },
  { key: "unitCost", label: "Koszt jedn." },
  { key: "markupPct", label: "Narzut %" },
  { key: "marginPerMachineHour", label: "Marża/h" },
];

function productStatus(product: Product): OrderStatus {
  const order = productionOrders.find((o) => o.productId === product.id);
  if (!order) return "zielony";
  return computeOrderSettlement(order).status;
}

export function ProduktyScreen() {
  const setSelectedProduct = useDemoStore((s) => s.setSelectedProduct);
  const applyToAll = useDemoStore((s) => s.applyToAllProducts);
  const setApplyToAll = useDemoStore((s) => s.setApplyToAllProducts);
  const pct = useDemoStore((s) => s.plasticPriceChangePct);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const overrides = applyToAll ? { materialPriceOverrides: applyPlasticPriceChange(pct) } : undefined;
  const { status: globalStatus } = sliderStatus(applyToAll ? pct : 0);

  const rows = useMemo(() => {
    return products.map((p) => {
      const econ = computeProductEconomics(p, overrides);
      const mainMaterial = getMaterial(p.recipe[0]!.materialId);
      return {
        product: p,
        mainMaterial: mainMaterial.symbol,
        unitCost: econ.unitCost,
        markupPct: econ.markupPct,
        marginPerMachineHour: econ.marginPerMachineHour,
        status: productStatus(p),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyToAll, pct]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sortKey === "name") {
        av = a.product.name;
        bv = b.product.name;
        return sortDir * av.localeCompare(bv, "pl");
      }
      if (sortKey === "cavities") {
        av = a.product.cavities;
        bv = b.product.cavities;
      } else if (sortKey === "cycleTimeS") {
        av = a.product.cycleTimeS;
        bv = b.product.cycleTimeS;
      } else if (sortKey === "priceZl") {
        av = a.product.priceZl;
        bv = b.product.priceZl;
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      return sortDir * ((av as number) - (bv as number));
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  const redCount = applyToAll && globalStatus === "czerwony" ? rows.length : 0;

  return (
    <div className="flex flex-col gap-4 p-6">
      {applyToAll && (
        <div
          className="flex items-center justify-between rounded-sm border px-4 py-3 text-[13px] font-medium"
          style={{
            borderColor:
              globalStatus === "czerwony"
                ? "var(--color-status-red)"
                : globalStatus === "zolty"
                ? "var(--color-status-amber)"
                : "var(--color-status-green)",
            color:
              globalStatus === "czerwony"
                ? "var(--color-status-red)"
                : globalStatus === "zolty"
                ? "var(--color-status-amber)"
                : "var(--color-status-green)",
            background:
              globalStatus === "czerwony"
                ? "var(--color-status-red-bg)"
                : globalStatus === "zolty"
                ? "var(--color-status-amber-bg)"
                : "var(--color-status-green-bg)",
          }}
        >
          <span className="flex items-center gap-2">
            <AlertTriangle size={15} />
            Zmiana cen tworzyw {pct >= 0 ? "+" : ""}
            {pct}% zastosowana do całego portfolio &mdash; {redCount} z {rows.length} pozycji wymaga renegocjacji
            ceny dla Klienta.
          </span>
          <button
            type="button"
            onClick={() => setApplyToAll(false)}
            className="rounded-sm border border-current px-2.5 py-1 text-[11.5px] font-semibold"
          >
            Wyczyść
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-sm border border-(--color-border) bg-(--color-card)">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-(--color-border) bg-(--color-bg)">
              <th className="w-8 px-3 py-2.5"></th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-faint)">
                Indeks
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="cursor-pointer select-none px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-faint) hover:text-(--color-steel)"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key &&
                      (sortDir === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                  </span>
                </th>
              ))}
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-faint)">
                Materiał główny
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.product.id}
                onClick={() => setSelectedProduct(row.product.id)}
                className="cursor-pointer border-b border-(--color-border) last:border-0 hover:bg-(--color-steel-light)"
              >
                <td className="px-3 py-2.5">
                  <StatusDot status={row.status} />
                </td>
                <td className="tabular px-3 py-2.5 font-medium">{row.product.id}</td>
                <td className="px-3 py-2.5">{row.product.name}</td>
                <td className="tabular px-3 py-2.5">{row.product.cavities}</td>
                <td className="tabular px-3 py-2.5">{row.product.cycleTimeS}</td>
                <td className="tabular px-3 py-2.5">{formatCurrency(row.product.priceZl, 4)}</td>
                <td className="tabular px-3 py-2.5">{formatCurrency(row.unitCost, 4)}</td>
                <td className="tabular px-3 py-2.5">{formatPercent(row.markupPct)}</td>
                <td className="tabular px-3 py-2.5 font-semibold" style={{ color: "var(--color-navy)" }}>
                  {formatNumber(row.marginPerMachineHour, 1)} zł/h
                </td>
                <td className="px-3 py-2.5 text-(--color-ink-soft)">{row.mainMaterial}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
