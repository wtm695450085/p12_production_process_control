"use client";

import { useState } from "react";
import { AlertTriangle, FileCheck2, PackageCheck } from "lucide-react";
import { DocumentField, DocumentSheet } from "@/components/DocumentSheet";
import { ProduktyScreen } from "./ProduktyScreen";
import { KalkulacjaScreen } from "./KalkulacjaScreen";
import { RaportZmianowyScreen } from "./RaportZmianowyScreen";
import { RozliczenieScreen } from "./RozliczenieScreen";
import { RentownoscScreen } from "./RentownoscScreen";
import { useDemoStore } from "@/store/useDemoStore";
import { customers, customerOrders, demoPeople, inventory, logisticsCards, materialRequirements, molds, packaging, productionHistory, productionOrderDetails, productionPlanEntries, purchaseInvoices, setterReports, shiftReportDocuments, technologyCards } from "@/lib/seed-data";
import { computeOrderSettlement, formatCurrency, formatNumber, formatPercent, getProduct } from "@/lib/calculations";
import { productionOrders } from "@/lib/seed-data";
import type { DocumentMeta, ModuleId } from "@/lib/types";
import { canEditDocument, canEditModule, getSystemUser, isOwner } from "@/lib/access-control";
import type { DocumentSymbol } from "@/lib/types";
import { ProductionBatches } from "@/components/ProductionBatches";
import { OwnerReport } from "@/components/OwnerReport";
import { OWNER_REPORT_TAB, resolveModuleTab } from "@/lib/module-config";
import { useT } from "@/lib/use-t";

function useModuleTab(id: ModuleId) { return useDemoStore((s) => s.moduleTabs[id]); }
function useCanEdit(moduleId: ModuleId) {
  const userId=useDemoStore(s=>s.activeUserId);
  return canEditModule(getSystemUser(userId),moduleId);
}
function useCanEditDocument(symbol: DocumentSymbol) {
  const userId=useDemoStore(s=>s.activeUserId);
  return canEditDocument(getSystemUser(userId),symbol);
}
/**
 * Wybór rekordu na liście modułu trzymany w store, dzięki czemu odesłanie
 * ze źródła liczby w raporcie właścicielskim otwiera dokładnie ten dokument.
 */
function useRecordFocus(moduleId: ModuleId, fallback: string): [string, (id: string) => void] {
  const selected=useDemoStore(s=>s.recordFocus[moduleId]);
  const setRecordFocus=useDemoStore(s=>s.setRecordFocus);
  return [selected ?? fallback, (id: string) => setRecordFocus(moduleId, id)];
}

export function Module1Screen() {
  const t = useT();
  const active = useModuleTab(1) ?? "kartoteka";
  const stale = useDemoStore((s) => s.p105CalculationStale);
  const purchase = useDemoStore((s) => s.purchasePriceApplied);
  if (active === "kalkulacja") return <div>{stale && <StaleCalculation /> }<KalkulacjaScreen /></div>;
  if (active === "klienci") return <div className="grid grid-cols-[260px_1fr] gap-4 p-5"><RecordList items={customers.map(c=>({id:c.id,label:c.name}))}/><DocumentSheet meta={meta("KK","KK/2026/K-001",1,demoPeople.salesperson,"handlowiec")} title="Karta klienta"><DocumentField label="Klient" value={customers[0]!.name}/><DocumentField label="NIP" value={customers[0]!.taxId}/><DocumentField label="Kontakt" value={`${customers[0]!.contactPerson} · ${customers[0]!.phone}`}/><DocumentField label="Warunki transportu" value={customers[0]!.transportTerms}/><DocumentField label="Adres dostawy" value="Centrum dystrybucyjne Zachód — wymaga potwierdzenia" changed/></DocumentSheet></div>;
  return <div>{stale && <StaleCalculation />}<ProduktyScreen /><div className="mx-6 mb-6"><DocumentSheet meta={meta("KP","KP/P-105/03",1,demoPeople.technologist,"technolog","ZP/2026/218")} title={t("Karta produktu — P-105 Rączka RAIS 2")}><div className="grid grid-cols-2 gap-x-5"><DocumentField label="Waga netto / brutto" value="18,0 / 22,0 g"/><DocumentField label="Forma" value="F-001"/><DocumentField label={t("Krotność / cykl")} value="2 / 32 s"/><DocumentField label="Technologia" value="KT/P-105/W4 v3"/><DocumentField label="TPE-S 4055" value={purchase ? "19,40 zł/kg" : "18,00 zł/kg"} source={purchase ? "FZ/2026/0619" : undefined} changed={purchase}/><DocumentField label="Kalkulacja" value={stale ? "NIEAKTUALNA" : "AKTUALNA"} changed={stale}/></div></DocumentSheet></div></div>;
}

function StaleCalculation() { const t = useT();
  return <div className="mx-6 mt-5 flex items-center justify-between border-2 border-(--color-status-red) bg-(--color-status-red-bg) px-4 py-3"><div className="flex items-center gap-3"><AlertTriangle className="text-(--color-status-red)" size={19}/><div><div className="text-[12px] font-bold text-(--color-status-red)">AK/2026/P-105 · KALKULACJA NIEAKTUALNA</div><div className="text-[11.5px] text-(--color-ink-soft)">{t("RKR/2026/0218 wykazało koszt 1,1783 zł przy cenie 1,1500 zł. Sugerowana cena przy narzucie 36,8%:")} <b>{t("1,6119 zł")}</b>.</div></div></div><span className="rounded-sm bg-(--color-status-red) px-2 py-1 text-[10px] font-bold text-white">{t("RKR → MODUŁ 1")}</span></div>;
}

export function Module2Screen() {
  const t = useT();
  const active=useModuleTab(2)??"zamowienia";
  const canEdit=useCanEdit(2);
  const canApprove=useCanEditDocument("PZL");
  const order=customerOrders[0]!;
  const [selectedOrderId, setSelectedOrderId] = useRecordFocus(2, "ZP/2026/218");
  const selectedOrder = productionOrders.find((item) => item.id === selectedOrderId) ?? productionOrders[0]!;
  const selectedProduct = getProduct(selectedOrder.productId);
  const selectedTechnology = technologyCards.find((item) => item.productId === selectedProduct.id)!;
  const selectedLogistics = logisticsCards.find((item) => item.productId === selectedProduct.id)!;
  const selectedMold = molds.find((item) => item.products.some((link) => link.productId === selectedProduct.id))!;
  const leadDetail = productionOrderDetails.find((item) => item.orderId === selectedOrder.id);
  const colorLines = leadDetail?.colorLines ?? [{
    color: selectedProduct.colors?.[0] ?? "wariant podstawowy",
    orderedQty: selectedOrder.orderedQty,
    goodQty: selectedOrder.goodQty,
    badQty: Math.max(0, selectedOrder.orderedQty - selectedOrder.goodQty),
  }];
  if(active==="szarze") return <ProductionBatches/>;
  if(active==="zlecenia") return <div className="grid grid-cols-[250px_1fr] gap-4 p-5"><RecordList selectedId={selectedOrder.id} onSelect={setSelectedOrderId} items={productionOrders.map(item=>({id:item.id,label:`${item.productId} · ${formatNumber(item.orderedQty,0)} szt.`}))}/><DocumentSheet meta={leadDetail?.document ?? meta("ZP",selectedOrder.id,2,demoPeople.planner,"planista",selectedOrder.id)} title="Zlecenie produkcyjne"><div className="grid grid-cols-2 gap-x-4"><DocumentField label={t("Zamówienie źródłowe")} value={leadDetail?.customerOrderId ?? `ZK/2026/${selectedOrder.id.slice(-3)}`}/><DocumentField label="Produkt" value={`${selectedProduct.id} · ${selectedProduct.name}`}/><DocumentField label="Maszyna / forma" value={`${selectedProduct.machineId} / ${selectedMold.id}`}/><DocumentField label="Technologia" value={`${selectedTechnology.id} v${selectedTechnology.versions.at(-1)!.version}`}/><DocumentField label="Logistyka" value={selectedLogistics.id}/><DocumentField label="Status" value={leadDetail?.status.toUpperCase() ?? "ZAKOŃCZONE"}/></div><div className="mt-4"><h3 className="mb-2 text-[11px] font-bold uppercase">Pozycje produkcyjne</h3><table className="w-full text-[12px]"><thead><tr className="bg-(--color-bg)"><th className="p-2 text-left">Wariant</th><th>Zlecono</th><th>Dobre</th><th>Wadliwe</th></tr></thead><tbody>{colorLines.map(l=><tr key={l.color} className="border-b"><td className="p-2 capitalize">{l.color}</td><td className="text-center font-mono">{l.orderedQty}</td><td className="text-center font-mono">{l.goodQty}</td><td className="text-center font-mono text-(--color-status-red)">{l.badQty}</td></tr>)}</tbody></table></div></DocumentSheet></div>;
  if(active==="zatwierdzanie") return <Centered><DocumentSheet meta={meta("PZL","PZL/2026/0218",2,demoPeople.controller,"kontrola","ZP/2026/218")} title={t("Protokół zatwierdzenia zlecenia")}><DocumentField label={t("Rozliczenie ilościowe")} value="4 720 dobrych · 768 wadliwych" source="RZ/2026/0429–0431"/><DocumentField label="Kontrola" value="Oczekuje na zatwierdzenie"/><DocumentField label="Skutek" value="Po zatwierdzeniu magazyn może wystawić WZ"/><button disabled={!canEdit||!canApprove} className="mt-4 w-full bg-(--color-navy) py-3 text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">{canApprove?"Zatwierdź i przekaż do WZ":"Brak prawa do dokumentu PZL"}</button></DocumentSheet></Centered>;
  return <Centered><DocumentSheet meta={order.document} title={t("Zamówienie klienta")}><DocumentField label="Klient" value="PetLine Polska sp. z o.o."/><DocumentField label="Termin dostawy" value={order.requiredDate}/><DocumentField label="Adres" value="Centrum dystrybucyjne Zachód" changed/><DocumentField label="Produkt" value="P-105 Rączka RAIS 2"/><DocumentField label={t("Ilość")} value="5 000 szt. · 5 kolorów po 1 000"/><DocumentField label="Cena" value="1,1500 zł/szt."/><DocumentField label={t("Powstałe dokumenty")} value="ZP/2026/218 · ZM/2026/0218" source="ZK/2026/077"/></DocumentSheet></Centered>;
}

export function Module3Screen() {
  const t = useT();
  const active=useModuleTab(3)??"operator"; const submit=useDemoStore(s=>s.submitLeadShiftReport);
  const finalize=useDemoStore(s=>s.finalizeCostSettlement); const stale=useDemoStore(s=>s.p105CalculationStale);
  const canEdit=useCanEdit(3);
  const canSubmitRz=useCanEditDocument("RZ"); const canCorrect=useCanEditDocument("PK"); const canFinalize=useCanEditDocument("RKR");
  const [historyProductId,setHistoryProductId]=useState("all");
  if(active==="historia") {
    const records=historyProductId==="all"?productionHistory:productionHistory.filter(item=>item.productId===historyProductId);
    return <div className="p-5"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-[14px] font-bold text-(--color-navy)">{t("Historia zrealizowanych procesów produkcyjnych")}</h2><p className="mt-1 text-[11.5px] text-(--color-ink-soft)">{t("Zatwierdzone i skorygowane produkcje z zachowaniem maszyny, formy i wersji technologii użytej w danym dniu.")}</p></div><label className="text-[10.5px] font-bold uppercase text-(--color-ink-faint)">{t("Wyrób")}<select value={historyProductId} onChange={event=>setHistoryProductId(event.target.value)} className="ml-2 h-9 border border-(--color-border-strong) bg-white px-3 text-[11.5px] font-medium normal-case text-(--color-ink)"><option value="all">Wszystkie wyroby</option>{["P-101","P-102","P-103","P-104","P-105","P-106"].map(id=><option key={id} value={id}>{id} · {getProduct(id).name}</option>)}</select></label></div><div className="overflow-hidden border border-(--color-border) bg-white"><table className="w-full text-[10.5px]"><thead className="bg-(--color-bg) uppercase text-(--color-ink-faint)"><tr><th className="p-2 text-left">Zlecenie / data</th><th className="text-left">{t("Wyrób")}</th><th>Maszyna / forma</th><th>KT</th><th>Zlecono</th><th>Dobre / braki</th><th>Cykl</th><th>{t("Brakowość")}</th><th>Koszt</th><th>Wynik</th><th>Operator</th></tr></thead><tbody>{records.map(record=><tr key={record.id} className="border-t"><td className="p-2"><b className="font-mono">{record.id}</b><div className="text-[9px] text-(--color-ink-faint)">{record.date} · {record.status}</div></td><td><b>{record.productId}</b><div className="max-w-32 truncate text-[9px] text-(--color-ink-faint)">{getProduct(record.productId).name}</div></td><td className="text-center font-mono">{record.machineId} / {record.moldId}</td><td className="text-center font-mono">v{record.technologyVersion}</td><td className="text-center font-mono">{formatNumber(record.orderedQty,0)}</td><td className="text-center font-mono">{formatNumber(record.goodQty,0)} / {formatNumber(record.badQty,0)}</td><td className="text-center font-mono">{record.actualCycleTimeS} s</td><td className="text-center font-mono">{formatPercent(record.scrapRatePct)}</td><td className="text-center font-mono">{formatCurrency(record.actualUnitCost,4)}</td><td className={`text-center font-mono font-bold ${record.resultTotalZl<0?"text-(--color-status-red)":"text-(--color-status-green)"}`}>{formatCurrency(record.resultTotalZl,2)}</td><td>{record.operator}</td></tr>)}</tbody></table></div><div className="mt-3 text-[10.5px] text-(--color-ink-faint)">Rekordów: {records.length}. Każda pozycja zachowuje historyczną wersję technologii i formę — późniejsze zmiany kart nie zmieniają przeszłości.</div></div>;
  }
  if(active==="koszt") return <div><div className="mx-5 mt-4 flex items-center justify-between border border-(--color-steel) bg-(--color-steel-light) px-4 py-3"><div><div className="text-[12px] font-bold text-(--color-navy)">RKR/2026/0218 · ROZLICZENIE GOTOWE</div><div className="text-[11.5px] text-(--color-ink-soft)">{t("Po zatwierdzeniu koszt wróci do kalkulacji P-105 i analityki.")}</div></div><button disabled={stale||!canEdit||!canFinalize} onClick={finalize} className="bg-(--color-navy) px-4 py-2 text-[11.5px] font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">{stale?"RKR przekazane":canEdit&&canFinalize?"Zatwierdź RKR i zamknij pętlę kosztową":"Brak prawa do dokumentu RKR"}</button></div><RozliczenieScreen/></div>;
  if(active==="nastawiacz") { const r=setterReports[0]!; return <Centered><DocumentSheet meta={r.document} title="Raport nastawiacza"><DocumentField label="Nastawiacz" value={r.setter}/><DocumentField label="Maszyna / forma" value={`${r.machineId} / ${r.moldId}`}/><DocumentField label="Przezbrojenie" value="01:15–05:45 · 4,5 h"/><DocumentField label="Uwagi" value={r.processNotes.join(" · ")}/></DocumentSheet></Centered>; }
  if(active==="korekta") return <Centered><DocumentSheet meta={meta("PK","PK/2026/0038",3,demoPeople.controller,"kontrola","ZP/2026/218")} title={t("Protokół korekty")}><DocumentField label="Pole" value="Sztuki wadliwe · kolor czerwony"/><DocumentField label="Przed / po" value="148 → 158"/><DocumentField label={t("Powód")} value="Korekta po uzgodnieniu z operatorem zmiany II"/><DocumentField label={t("Ślad")} value="E. Kamińska · 16.06.2026 08:14"/><button disabled={!canEdit||!canCorrect} className="mt-4 w-full bg-(--color-navy) py-3 text-[12px] font-bold text-white disabled:bg-gray-300">{canCorrect?"Zatwierdź korektę i przelicz koszt":"Brak prawa do dokumentu PK"}</button></DocumentSheet></Centered>;
  const r=shiftReportDocuments[2]!;
  return <div className="p-5"><div className="mx-auto max-w-[980px]"><DocumentSheet meta={r.document} title="Raport zmianowy operatora" actions={<button disabled={!canEdit||!canSubmitRz} onClick={submit} className="h-14 w-full bg-(--color-navy) text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">{canEdit&&canSubmitRz?"Złóż raport i przekaż do 5 modułów":"Brak prawa do dokumentu RZ"}</button>}><div className="grid grid-cols-2 gap-x-4"><DocumentField label="Operator / zmiana" value={`${r.operator} / III`}/><DocumentField label="Maszyna / forma" value={`${r.machineId} / ${r.moldId}`}/><DocumentField label="Dobre / wadliwe" value={`${formatNumber(r.goodQty,0)} / ${formatNumber(r.badQty,0)} szt.`}/><DocumentField label="Rzeczywisty cykl" value="39 s" changed/><DocumentField label={t("Przezbrojenie narastająco")} value="4,5 h" source="RN/2026/0118"/><DocumentField label="Uwagi" value={r.notes} changed/></div></DocumentSheet><details className="mt-4 border border-(--color-border) bg-white"><summary className="cursor-pointer px-4 py-3 text-[12px] font-semibold">{t("Otwórz pełny panel operatorski")}</summary>{canEdit&&canSubmitRz?<RaportZmianowyScreen/>:<div className="p-5 text-[12px] text-(--color-ink-soft)">Formularz RZ jest zablokowany dla tej roli.</div>}</details></div></div>;
}

export function Module4Screen() {
  const t = useT();
  const setup=useDemoStore(s=>s.planSetupHours); const service=useDemoStore(s=>s.moldF001InService);
  return <div className="p-5"><div className="mb-3 flex gap-3"><Kpi label={t("Zajęte maszyny")} value="4 / 6"/><Kpi label="Przezbrojenia" value={`${formatNumber(setup,1)} h`} changed={setup===4.5}/><Kpi label={t("Zagrożenia")} value={service?"1":"0"} danger={service}/></div><div className="border border-(--color-border) bg-white"><div className="grid grid-cols-[120px_repeat(7,1fr)] bg-(--color-bg) text-[10px] font-bold"><div className="p-2">MASZYNA</div>{["PON","WT","ŚR","CZW","PT","SOB","ND"].map(d=><div key={d} className="border-l p-2 text-center">{d}</div>)}</div>{["W1","W2","W3","W4","W5","W6"].map((m,i)=><div key={m} className="grid min-h-16 grid-cols-[120px_1fr] border-t"><div className="p-3 font-mono text-[12px] font-bold">{m}</div><div className="relative m-2 bg-(--color-bg)">{productionPlanEntries.filter(e=>e.machineId===m).map((e,j)=><div key={e.id} className={`absolute top-${j*7} h-8 rounded-sm border px-2 py-1 text-[10px] ${e.productionOrderId==="ZP/2026/218"&&service?"border-(--color-status-red) bg-(--color-status-red-bg) text-(--color-status-red)":e.estimated?"border-dashed border-(--color-steel) bg-white":"border-(--color-steel) bg-(--color-steel-light)"}`} style={{left:`${(i*11+j*18)%65}%`,width:"32%"}}>{e.label} · {e.setupTimeH===3&&setup===4.5?"4,5":e.setupTimeH} h</div>)}</div></div>)}</div>{service&&<div className="mt-3 border border-(--color-status-red) bg-(--color-status-red-bg) p-3 text-[12px] text-(--color-status-red)"><b>ZAF/2026/0017:</b> {t("F-001 w serwisie — plan oznaczony jako zagrożony.")}</div>}</div>;
}

export function Module5Screen() {
  const t = useT();
  const inService=useDemoStore(s=>s.moldF001InService);
  const active=useModuleTab(5)??"formy";
  const [selectedMoldId, setSelectedMoldId] = useRecordFocus(5, "F-001");
  const mold=molds.find((item) => item.id === selectedMoldId) ?? molds[0]!;
  const effectiveStatus = mold.id === "F-001" && inService ? "serwis" : mold.status;
  if(active==="awarie") return <Centered><DocumentSheet meta={meta("ZAF","ZAF/2026/0017",5,"M. Nowak","operator","ZP/2026/218")} title={t("Zgłoszenie awarii formy")}><DocumentField label="Forma" value="F-001"/><DocumentField label="Zlecenie" value="ZP/2026/218"/><DocumentField label="Opis" value="Zacinanie wypychacza gniazda 2"/><DocumentField label="Status" value={inService?"SERWIS":"ROBOCZE"} changed={inService}/></DocumentSheet></Centered>;
  if(active==="serwis") return <Centered><DocumentSheet meta={meta("PSF","PSF/2026/0041",5,demoPeople.toolmaker,"narzędziownia","ZP/2026/218")} title={t("Protokół serwisu formy")}><DocumentField label="Zakres" value="Demontaż, czyszczenie i regulacja wypychacza"/><DocumentField label="Status" value={inService?"W REALIZACJI":"OCZEKUJE"}/><DocumentField label={t("Planowany odbiór")} value="17.06.2026 10:00"/><button className="mt-4 w-full border border-(--color-navy) py-3 text-[12px] font-bold text-(--color-navy)">{t("Zakończ serwis i zwolnij plan")}</button></DocumentSheet></Centered>;
  return <div className="grid grid-cols-[260px_1fr] gap-4 p-5"><RecordList selectedId={mold.id} onSelect={setSelectedMoldId} items={molds.map(m=>({id:m.id,label:`${m.name} · ${m.id === "F-001" && inService ? "serwis" : m.status}`}))}/><DocumentSheet meta={meta("KF",`KF/${mold.id}/2026`,5,demoPeople.toolmaker,"narzędziownia")} title={mold.status==="wycofana"?"Paszport formy wycofanej":"Karta formy"}><div className="grid grid-cols-2 gap-x-4"><DocumentField label="Forma" value={mold.name}/><DocumentField label="Status" value={effectiveStatus.replace("_", " ").toUpperCase()} changed={mold.id === "F-001" && inService || mold.status==="wycofana"}/><DocumentField label="Wymiary" value={mold.dimensionsMm.join(" × ")+" mm"}/><DocumentField label="Waga" value={`${mold.weightKg} kg`}/><DocumentField label={t("Pole odkładcze")} value={mold.depositingAreaMm.join(" × ")+" mm"}/><DocumentField label="Lokalizacja" value={mold.location}/><DocumentField label={t("Licznik końcowy cykli")} value={formatNumber(mold.cycleCounter + (mold.id === "F-001" && inService ? 2744 : 0),0)} source={mold.id === "F-001" && inService?"RZ/2026/0429–0431":undefined} changed={mold.id === "F-001" && inService}/><DocumentField label="Produkty" value={mold.products.map(link => `${link.productId} ${getProduct(link.productId).name}`).join(" · ")}/><DocumentField label="Metoda przezbrojenia" value={mold.products.map(link => `${link.productId}: ${link.changeoverMethod} (${formatNumber(link.standardSetupTimeH,1)} h)`).join(" · ")}/><DocumentField label="Historia awarii" value={`${mold.incidents.length} ${mold.incidents.length === 1 ? "wpis" : "wpisy"}${mold.id === "F-001" && inService ? " + bieżące zgłoszenie" : ""}`}/>{mold.status==="wycofana"&&<><DocumentField label="Okres eksploatacji" value={`${mold.commissionedAt} → ${mold.retiredAt}`}/><DocumentField label={t("Powód wycofania")} value={mold.retirementReason} changed/></>}</div>{mold.status==="wycofana"&&<div className="mt-4 border-2 border-(--color-status-red) bg-(--color-status-red-bg) p-3 text-[11.5px] text-(--color-status-red)"><b>{t("FORMA WYCOFANA — BLOKADA UŻYCIA.")}</b> {t("Pozostaje w systemie wyłącznie jako paszport historyczny i źródło danych dawnych produkcji.")}</div>}{mold.incidents.length>0&&<div className="mt-4"><div className="mb-2 text-[10.5px] font-bold uppercase text-(--color-ink-faint)">{t("Historia zdarzeń formy")}</div>{mold.incidents.map(incident=><div key={incident.id} className="grid grid-cols-[110px_100px_1fr] border-t border-(--color-border) py-2 text-[10.5px]"><b className="font-mono">{incident.id}</b><span>{incident.date}</span><span>{incident.description} <span className="text-(--color-ink-faint)">→ {incident.resolution}</span></span></div>)}</div>}</DocumentSheet></div>;
}

export function Module6Screen() {
  const t = useT();
  const notes=useDemoStore(s=>s.technologyNotes);
  const [selectedCardId, setSelectedCardId] = useRecordFocus(6, "KT/P-105/W4");
  const card=technologyCards.find(c=>c.id===selectedCardId) ?? technologyCards[0]!;
  const v=card.versions.at(-1)!;
  const product=getProduct(card.productId);
  const relatedNotes = card.productId === "P-105" ? notes : [];
  return <div className="grid grid-cols-[250px_1fr] gap-4 p-5"><RecordList selectedId={card.id} onSelect={setSelectedCardId} items={technologyCards.map(c=>({id:c.id,label:`${getProduct(c.productId).name} · v${c.versions.at(-1)!.version}`}))}/><DocumentSheet meta={meta("KT",`${card.id}/v${v.version}`,6,demoPeople.technologist,"technolog")} title="Karta technologiczna"><div className="grid grid-cols-2 gap-x-4"><DocumentField label="Produkt / maszyna" value={`${product.id} ${product.name} / ${card.machineId}`}/><DocumentField label="Forma" value={card.moldId}/><DocumentField label="Wersja / status" value={`v${v.version} · ${v.status.toUpperCase()}`}/><DocumentField label={t("Obowiązuje od")} value={v.validFrom}/>{v.parameters.map(p=><DocumentField key={p.label} label={p.label} value={`${p.value} ${p.unit??""}`}/>)}</div><div className="mt-4 border border-(--color-border) p-3"><b className="text-[11px] uppercase">Uwagi technologiczne i z hali</b>{[...v.notes,...relatedNotes].length?[...v.notes,...relatedNotes].map(n=><div key={n} className="mt-2 bg-[#fff7d6] p-2 text-[12px]">{n}</div>):<div className="mt-2 text-[12px] text-(--color-ink-faint)">Brak nowych uwag.</div>}</div></DocumentSheet></div>;
}

export function Module7Screen() {
  const t = useT();
  const [selectedProductId, setSelectedProductId] = useRecordFocus(7, "P-105");
  const card=logisticsCards.find(c=>c.productId===selectedProductId) ?? logisticsCards[0]!;
  const product=getProduct(card.productId);
  const box=packaging.find(p=>p.id===card.packagingId)!;
  const palletHeight=144+card.layersPerPallet*box.dimensionsMm[2]; const units=card.unitsPerPackage*card.packagesPerLayer*card.layersPerPallet;
  return <div className="grid grid-cols-[250px_1fr] gap-4 p-5"><RecordList selectedId={product.id} onSelect={setSelectedProductId} items={logisticsCards.map(item=>({id:item.productId,label:getProduct(item.productId).name}))}/><DocumentSheet meta={meta("KL",`${card.id}/v2`,7,"I. Król","logistyka")} title="Karta logistyczna"><div className="grid grid-cols-2 gap-x-4"><DocumentField label="Produkt" value={`${product.id} ${product.name}`}/><DocumentField label="Opakowanie" value={box.name}/><DocumentField label="Sztuk w kartonie" value={`${card.unitsPerPackage} szt.`}/><DocumentField label={t("Kartony na warstwę")} value={card.packagesPerLayer}/><DocumentField label="Warstwy" value={card.layersPerPallet}/><DocumentField label="Sztuk na palecie" value={`${formatNumber(units,0)} szt.`}/><DocumentField label={t("Wysokość palety")} value={`${palletHeight} mm / limit ${card.maxPalletHeightMm} mm`}/><DocumentField label="Masa produktu w kartonie" value={`${formatNumber(card.unitsPerPackage*product.weightNetG/1000,2)} kg`}/><DocumentField label="Operacje dodatkowe" value={card.additionalOperations.join(" · ") || "Brak"}/></div><div className="mt-4 flex items-center gap-2 bg-(--color-status-green-bg) p-3 text-[12px] text-(--color-status-green)"><PackageCheck size={16}/><b>{t("Paleta zgodna z limitem przewoźnika.")}</b></div></DocumentSheet></div>;
}

export function Module8Screen() {
  const t = useT();
  const active=useModuleTab(8)??"stany"; const apply=useDemoStore(s=>s.applyPurchaseInvoice); const applied=useDemoStore(s=>s.purchasePriceApplied); const consumed=useDemoStore(s=>s.materialConsumedKg);
  const canEdit=useCanEdit(8);
  const canEditFz=useCanEditDocument("FZ");
  if(active==="rezerwacje") { const req=materialRequirements[0]!; return <Centered><DocumentSheet meta={req.document} title={t("Zapotrzebowanie materiałowe")}><DocumentField label="Zlecenie" value={req.productionOrderId}/>{req.lines.map(l=><DocumentField key={l.itemId} label={l.itemId} value={`${l.requiredQuantity} ${l.unit} · zarezerwowano ${l.reservedQuantity} · domówić ${l.toOrderQuantity}`}/>)}</DocumentSheet></Centered>; }
  if(active==="faktury") { const inv=purchaseInvoices[0]!; return <Centered><DocumentSheet meta={inv.document} title={t("Faktura zakupu — wejście cen")} actions={<button onClick={apply} disabled={applied||!canEdit||!canEditFz} className="w-full bg-(--color-navy) py-3 text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">{applied?"Cena przekazana do kalkulacji":canEdit&&canEditFz?"Zatwierdź cenę i przekaż do modułów 1 i 9":"Brak prawa do dokumentu FZ"}</button>}><DocumentField label="Dostawca" value={inv.supplier}/><DocumentField label={t("Materiał")} value="M1 · TPE-S 4055"/><DocumentField label={t("Ilość")} value="500 kg"/><DocumentField label="Cena poprzednia" value="18,00 zł/kg"/><DocumentField label="Cena z faktury" value="19,40 zł/kg" changed/><DocumentField label="Skutek" value="Przeliczenie marż wszystkich produktów zawierających M1"/></DocumentSheet></Centered>; }
  if(active==="dokumenty") return <div className="grid grid-cols-2 gap-4 p-5"><MiniDocument symbol="PZ" number="PZ/2026/0331" title={t("Przyjęcie TPE-S 4055")} status="ZATWIERDZONY"/><MiniDocument symbol="WZ" number="WZ/2026/0198" title="Wydanie dla PetLine Polska" status="OCZEKUJE NA PZL"/></div>;
  return <div className="p-5"><div className="overflow-hidden border border-(--color-border) bg-white"><table className="w-full text-[12px]"><thead className="bg-(--color-bg) text-[10.5px] uppercase text-(--color-ink-faint)"><tr><th className="p-3 text-left">Indeks</th><th className="text-left">Typ</th><th>Stan</th><th>Rezerwacja</th><th>{t("Dostępne")}</th><th>Minimum</th><th>Lokalizacja</th></tr></thead><tbody>{inventory.map(i=>{const q=i.itemId==="M1"&&consumed?i.quantity-consumed:i.quantity;const low=q-i.reservedQuantity<i.minimumQuantity;return <tr key={i.id} className={`border-t ${low?"bg-(--color-status-red-bg)":""}`}><td className="p-3 font-mono font-bold">{i.itemId}</td><td>{i.itemType==="material"?"materiał":"opakowanie"}</td><td className="text-center font-mono">{formatNumber(q,1)}</td><td className="text-center font-mono">{formatNumber(i.reservedQuantity,1)}</td><td className="text-center font-mono font-bold">{formatNumber(q-i.reservedQuantity,1)}</td><td className="text-center font-mono">{i.minimumQuantity}</td><td className="text-center">{i.location}</td></tr>})}</tbody></table></div>{consumed>0&&<div className="mt-3 bg-[#fff7d6] p-3 text-[12px]"><b>RZ/2026/0431:</b> zdjęto ze stanu {formatNumber(consumed,1)} kg materiału.</div>}</div>;
}

export function Module9Screen() {
  const t = useT();
  const owner=isOwner(getSystemUser(useDemoStore(s=>s.activeUserId)));
  const active=resolveModuleTab(9,useModuleTab(9),owner); const stale=useDemoStore(s=>s.p105CalculationStale);
  if(active===OWNER_REPORT_TAB) return <OwnerReport/>;
  if(active==="rentownosc") return <RentownoscScreen/>;
  if(active==="odchylenia") return <div className="p-5"><div className="border border-(--color-border) bg-white"><table className="w-full text-[12px]"><thead className="bg-(--color-bg)"><tr><th className="p-3 text-left">Zlecenie</th><th>Produkt</th><th>Koszt plan</th><th>Koszt rzecz.</th><th>Odchylenie</th><th>Wynik</th></tr></thead><tbody>{productionOrders.map(o=>{const s=computeOrderSettlement(o);return <tr key={o.id} className="border-t"><td className="p-3 font-mono">{o.id}</td><td>{s.product.id}</td><td className="text-center font-mono">{formatCurrency(s.calc.unitCost,4)}</td><td className="text-center font-mono">{formatCurrency(s.actualUnitCost,4)}</td><td className="text-center font-mono">{formatPercent(s.deviationPct)}</td><td className="text-center font-mono">{formatCurrency(s.resultTotal,2)}</td></tr>})}</tbody></table></div></div>;
  return <div className="p-5"><div className="grid grid-cols-4 gap-3"><Kpi label="Koszt planowany P-105" value="0,8406 zł"/><Kpi label="Koszt rzeczywisty" value="1,1783 zł" changed={stale}/><Kpi label="Odchylenie" value="+40,2%" danger/><Kpi label="Wynik zlecenia" value="−133,56 zł" danger/></div><div className="mt-4 grid grid-cols-[1fr_320px] gap-4"><div className="border border-(--color-border) bg-white p-5"><h3 className="text-[13px] font-bold">{t("Wynik według perspektywy")}</h3>{[["Produkt","P-105","−133,56 zł"],["Klient","PetLine Polska","−133,56 zł"],["Maszyna","W4 · Arburg 100T","69,6 zł/h plan → −6,4 zł/h rzecz."]].map(r=><div key={r[0]} className="grid grid-cols-[100px_1fr_auto] border-b py-3 text-[12px]"><b>{r[0]}</b><span>{r[1]}</span><span className="font-mono font-bold text-(--color-status-red)">{r[2]}</span></div>)}</div><DocumentSheet meta={meta("ALR","ALR/2026/0218",9,"System P12","system","ZP/2026/218")} title={t("Alert rentowności")}><DocumentField label="Poziom" value="KRYTYCZNY"/><DocumentField label="Przyczyna" value="Cena poniżej kosztu"/><DocumentField label={t("Działanie")} value="Rewizja AK/P-105"/><DocumentField label={t("Właściciel")} value="Właściciel / controlling"/></DocumentSheet></div></div>;
}

function meta(symbol: DocumentMeta["symbol"], number: string, moduleId: ModuleId, author: string, role: string, relatedOrderId?: string): DocumentMeta {
  return { id:`DOC-${number}`,symbol,number,moduleId,author,authorRole:role,date:"2026-06-16",status:"zatwierdzony",relatedOrderId };
}
function Centered({children}:{children:React.ReactNode}) { return <div className="mx-auto max-w-[980px] p-5">{children}</div>; }
function RecordList({items,selectedId,onSelect}:{items:{id:string;label:string}[];selectedId?:string;onSelect?:(id:string)=>void}) { const activeId=selectedId??items[0]?.id; return <aside className="border border-(--color-border) bg-white p-2">{items.map((i)=><button type="button" key={i.id} onClick={() => onSelect?.(i.id)} className={`mb-1 w-full border px-3 py-2 text-left ${i.id===activeId?"border-(--color-steel) bg-(--color-steel-light)":"border-transparent hover:border-(--color-border)"}`}><div className="font-mono text-[11px] font-bold">{i.id}</div><div className="mt-0.5 text-[11px] text-(--color-ink-soft)">{i.label}</div></button>)}</aside>; }
function Kpi({label,value,danger,changed}:{label:string;value:string;danger?:boolean;changed?:boolean}) { return <div className={`flex-1 border bg-white p-4 ${danger?"border-(--color-status-red)":changed?"border-(--color-status-amber)":"border-(--color-border)"}`}><div className="text-[10.5px] font-bold uppercase text-(--color-ink-faint)">{label}</div><div className={`mt-1 font-mono text-[20px] font-bold ${danger?"text-(--color-status-red)":"text-(--color-navy)"}`}>{value}</div></div>; }
function MiniDocument({symbol,number,title,status}:{symbol:string;number:string;title:string;status:string}) { return <div className="border-2 border-(--color-border-strong) bg-white"><div className="border-b-2 border-(--color-navy) p-4"><div className="font-mono font-bold text-(--color-navy)">{number}</div><div className="text-[12px] font-semibold">{symbol} · {title}</div></div><div className="p-5 text-[12px]"><FileCheck2 className="mb-3 text-(--color-steel)"/><b>Status: {status}</b></div></div>; }
