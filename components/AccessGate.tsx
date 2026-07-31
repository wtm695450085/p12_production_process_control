"use client";
import { Eye, LockKeyhole } from "lucide-react";
import { canEditModule, canView, getSystemUser } from "@/lib/access-control";
import { UserAvatar } from "./UserAvatar";
import { moduleConfigs } from "@/lib/module-config";
import { useDemoStore } from "@/store/useDemoStore";
import type { ModuleId } from "@/lib/types";
import { useT } from "@/lib/use-t";

export function AccessGate({moduleId,children}:{moduleId:ModuleId;children:React.ReactNode}){
  const t=useT(); const userId=useDemoStore(s=>s.activeUserId); const setModule=useDemoStore(s=>s.setModule); const user=getSystemUser(userId);
  if(!canView(user,moduleId)) return <div className="flex min-h-[70vh] items-center justify-center p-8"><div className="w-[520px] border-2 border-(--color-status-red) bg-white p-7 text-center"><LockKeyhole className="mx-auto text-(--color-status-red)" size={36}/><h1 className="mt-3 text-[17px] font-bold">{t("BRAK DOSTĘPU DO MODUŁU")} {moduleId}</h1><div className="mt-4 flex justify-center"><UserAvatar user={user} size={56}/></div><p className="mt-2 text-[12px] text-(--color-ink-soft)">{user.name} · {t(user.jobTitle)} — {t("nie ma prawa oglądać danych modułu")} „{t(moduleConfigs[moduleId].name)}”. {t("Próba dostępu byłaby zapisana w audycie.")}</p><button onClick={()=>setModule(10)} className="mt-5 bg-(--color-navy) px-4 py-2.5 text-[12px] font-bold text-white">{t("Zobacz macierz uprawnień")}</button></div></div>;
  return <div data-access={canEditModule(user,moduleId)?"edit":"view"}>{!canEditModule(user,moduleId)&&<div className="flex items-center justify-center gap-2 border-b border-(--color-steel) bg-(--color-steel-light) px-4 py-2 text-[11px] font-semibold text-(--color-navy)"><Eye size={13}/> {t("TRYB TYLKO DO ODCZYTU")} · {user.name} {t("nie może edytować dokumentów w tym module")}</div>}{children}</div>
}
