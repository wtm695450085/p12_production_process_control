"use client";

import { useEffect } from "react";
import { useDemoStore } from "@/store/useDemoStore";

export function KeyboardShortcuts() {
  const setScreen = useDemoStore((s) => s.setScreen);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;
      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        setScreen(Number(e.key) as 1 | 2 | 3 | 4 | 5);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setScreen]);

  return null;
}
