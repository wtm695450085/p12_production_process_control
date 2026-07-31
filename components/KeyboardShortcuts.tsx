"use client";
import { useEffect } from "react";
import { useDemoStore, type AppModuleId } from "@/store/useDemoStore";
export function KeyboardShortcuts() {
  const setModule = useDemoStore((s) => s.setModule);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(el?.tagName ?? "") || el?.isContentEditable) return;
      if (/^[0-9]$/.test(e.key)) setModule(Number(e.key) as AppModuleId);
      if (e.key.toLowerCase() === "m") setModule(0);
      if (e.key.toLowerCase() === "a") setModule(10);
    };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [setModule]);
  return null;
}
