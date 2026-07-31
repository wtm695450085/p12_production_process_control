"use client";
import {useState} from "react";
import {RotateCcw} from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import {useDemoStore} from "@/store/useDemoStore";
import {systemUsers} from "@/lib/access-control";
import {languages} from "@/lib/i18n";
import {useT} from "@/lib/use-t";

export function TopBar(){
 const t=useT();
 const reset=useDemoStore(s=>s.resetDemo),activeUserId=useDemoStore(s=>s.activeUserId),setActiveUser=useDemoStore(s=>s.setActiveUser);
 const lang=useDemoStore(s=>s.lang),setLang=useDemoStore(s=>s.setLang);
 const [done,setDone]=useState(false);const user=systemUsers.find(item=>item.id===activeUserId)??systemUsers[0]!;
 return <header className="flex h-12 items-center justify-between border-b border-(--color-border) bg-white px-5"><div className="text-[11.5px] text-(--color-ink-soft)"><b className="text-(--color-navy)">{t("SCENARIUSZ:")}</b> {t("ZK/2026/077 → ZP/2026/218 · P-105 Rączka RAIS 2")}</div><div className="flex items-center gap-2">
  <div className="flex items-center gap-2 border-r border-(--color-border) pr-3"><UserAvatar user={user} size={30}/><div className="leading-tight"><div className="text-[10px] font-bold">{user.name}</div><div className="text-[9px] text-(--color-ink-faint)">{t(user.jobTitle)}</div></div><select aria-label={t("Wciel się w użytkownika")} value={activeUserId} onChange={e=>setActiveUser(e.target.value)} className="h-8 border border-(--color-border-strong) bg-white px-2 text-[10.5px]"><option value={activeUserId}>{t("Wciel się…")}</option>{systemUsers.filter(item=>item.id!==activeUserId).map(item=><option key={item.id} value={item.id}>{item.name} · {t(item.jobTitle)}</option>)}</select></div>
  <div className="flex items-center border-r border-(--color-border) pr-3" role="group" aria-label={t("Język interfejsu")}>{languages.map(item=><button key={item.id} type="button" title={item.title} aria-pressed={lang===item.id} onClick={()=>setLang(item.id)} className={`border px-2 py-1 text-[10.5px] font-bold ${lang===item.id?"border-(--color-navy) bg-(--color-navy) text-white":"border-(--color-border-strong) bg-white text-(--color-ink-soft) hover:text-(--color-navy)"}`}>{item.label}</button>)}</div>
  <button onClick={() => { reset(); setDone(true); setTimeout(() => setDone(false), 1200); }} className="flex items-center gap-1.5 rounded-sm border border-(--color-border-strong) px-3 py-1.5 text-[11.5px] font-semibold text-(--color-ink-soft) hover:text-(--color-navy)"><RotateCcw size={13}/>{done ? t("Zresetowano") : t("Reset demo")}</button></div></header>;
}
