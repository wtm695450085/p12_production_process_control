"use client";

import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WaterfallStep } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/calculations";

interface Props {
  baseline: number;
  steps: WaterfallStep[];
  total: number;
}

interface Bucket {
  name: string;
  fullLabel: string;
  base: number;
  value: number;
  isTotal: boolean;
  cumulative: number;
  impact?: number;
}

function MultilineTick({ x, y, payload }: { x: number; y: number; payload: { value: string } }) {
  const lines = String(payload.value).split("\n");
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fontSize={10.5} fill="var(--color-ink-soft)">
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 12 : 12}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export function WaterfallChart({ baseline, steps, total }: Props) {
  const buckets: Bucket[] = [];
  let cumulative = baseline;

  buckets.push({
    name: "Koszt\nkalkulacyjny",
    fullLabel: "Koszt kalkulacyjny",
    base: 0,
    value: baseline,
    isTotal: true,
    cumulative: baseline,
  });

  for (const step of steps) {
    const start = cumulative;
    const end = cumulative + step.impact;
    buckets.push({
      name: step.shortLabel,
      fullLabel: step.label,
      base: Math.min(start, end),
      value: Math.abs(step.impact),
      isTotal: false,
      cumulative: end,
      impact: step.impact,
    });
    cumulative = end;
  }

  buckets.push({
    name: "Koszt\nrzeczywisty",
    fullLabel: "Koszt rzeczywisty",
    base: 0,
    value: baseline + total,
    isTotal: true,
    cumulative: baseline + total,
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={buckets} margin={{ top: 8, right: 16, left: 8, bottom: 24 }} barCategoryGap="18%">
        <XAxis
          dataKey="name"
          tick={<MultilineTick x={0} y={0} payload={{ value: "" }} />}
          interval={0}
          tickLine={false}
          height={38}
          axisLine={{ stroke: "var(--color-border-strong)" }}
        />
        <YAxis
          tickFormatter={(v) => formatNumber(v, 2)}
          tick={{ fontSize: 10.5, fill: "var(--color-ink-soft)" }}
          width={56}
          tickLine={false}
          axisLine={{ stroke: "var(--color-border-strong)" }}
          domain={["dataMin - 0.05", "dataMax + 0.05"]}
        />
        <ReferenceLine y={baseline} stroke="var(--color-border-strong)" strokeDasharray="3 3" />
        <Tooltip
          formatter={(_value, _name, props) => {
            const p = props.payload as Bucket;
            if (p.isTotal) return [formatCurrency(p.value, 4), p.fullLabel];
            return [`${(p.impact ?? 0) >= 0 ? "+" : ""}${formatCurrency(p.impact ?? 0, 4)}`, p.fullLabel];
          }}
          labelFormatter={() => ""}
          contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "var(--color-border-strong)" }}
        />
        <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="value" stackId="a" radius={[2, 2, 2, 2]} isAnimationActive={false}>
          {buckets.map((b, i) => (
            <Cell
              key={i}
              fill={
                b.isTotal
                  ? "var(--color-navy)"
                  : (b.impact ?? 0) >= 0
                  ? "var(--color-status-red)"
                  : "var(--color-status-green)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
