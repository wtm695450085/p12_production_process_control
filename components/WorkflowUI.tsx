"use client";
import { CheckCircle2, FileInput, X } from "lucide-react";
import { moduleConfigs } from "@/lib/module-config";
import { useDemoStore } from "@/store/useDemoStore";
import type { ModuleId } from "@/lib/types";
import { useT } from "@/lib/use-t";

const EMPTY_MESSAGES: string[] = [];

export function InboxBanner({ moduleId }: { moduleId: ModuleId }) {
  const t = useT();
  const count = useDemoStore((s) => s.inboxCounts[moduleId] ?? 0);
  // useSyncExternalStore (used by Zustand/React 19) requires a stable snapshot.
  // A literal `[]` fallback would create a new reference on every read and can
  // trigger an infinite hydration loop before the first interaction.
  const messages = useDemoStore((s) => s.inboxMessages[moduleId] ?? EMPTY_MESSAGES);
  const ack = useDemoStore((s) => s.acknowledgeInbox);
  if (!count) return null;
  return <div className="mx-5 mt-4 border border-(--color-status-amber) bg-[#fff7d6] px-4 py-3"><div className="flex justify-between"><div className="flex gap-2"><FileInput size={16} className="text-(--color-status-amber)"/><div><div className="text-[12px] font-bold">{t("PRZYJĘTO")} {count} {count === 1 ? t("DOKUMENT") : t("DOKUMENTY")}</div>{messages.map((m, i) => <div key={i} className="mt-1 text-[11.5px] text-(--color-ink-soft)">{m}</div>)}</div></div><button onClick={() => ack(moduleId)} className="text-(--color-ink-faint)"><X size={15}/></button></div></div>;
}

export function RouteConfirmation() {
  const t = useT();
  const confirmation = useDemoStore((s) => s.routeConfirmation);
  const close = useDemoStore((s) => s.closeRouteConfirmation);
  const setModule = useDemoStore((s) => s.setModule);
  if (!confirmation) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16294acc]"><div className="w-[620px] border-2 border-(--color-navy) bg-white p-6"><div className="flex items-center gap-3 border-b border-(--color-border) pb-4"><CheckCircle2 size={28} className="text-(--color-status-green)"/><div><div className="text-[17px] font-bold text-(--color-navy)">{t("DOKUMENT PRZEKAZANY")}</div><div className="font-mono text-[12px]">{confirmation.documentNumber}</div></div></div><div className="py-4">{confirmation.targets.map((id, i) => <div key={id} style={{ animationDelay: `${i * 250}ms` }} className="route-enter mb-2 flex items-center justify-between border border-(--color-border) bg-(--color-bg) px-3 py-2"><div><b className="text-[12px]">→ {t("MODUŁ")} {id} · {t(moduleConfigs[id].shortName)}</b><div className="text-[11px] text-(--color-ink-soft)">{t("Dokument dotarł i zaktualizował powiązane dane.")}</div></div><button onClick={() => { close(); setModule(id); }} className="rounded-sm border border-(--color-steel) px-2 py-1 text-[11px] font-semibold text-(--color-steel)">{t("zobacz")}</button></div>)}</div><button onClick={close} className="w-full bg-(--color-navy) py-2.5 text-[12px] font-bold text-white">{t("Zamknij")}</button></div></div>;
}
