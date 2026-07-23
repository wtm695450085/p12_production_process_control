import type { OrderStatus } from "@/lib/types";

const COLOR: Record<OrderStatus, string> = {
  zielony: "var(--color-status-green)",
  zolty: "var(--color-status-amber)",
  czerwony: "var(--color-status-red)",
};

export function StatusDot({ status, size = 8 }: { status: OrderStatus; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: COLOR[status] }}
      aria-label={`status: ${status}`}
    />
  );
}

export function statusColor(status: OrderStatus): string {
  return COLOR[status];
}
