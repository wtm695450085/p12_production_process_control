"use client";
import { useDemoStore } from "@/store/useDemoStore";
import { translate, type Lang } from "./i18n";

export function useLang(): Lang {
  return useDemoStore((s) => s.lang);
}

/** Tłumaczy tekst źródłowy na aktualnie wybrany język interfejsu. */
export function useT(): (text: string) => string {
  const lang = useLang();
  return (text: string) => translate(lang, text);
}
