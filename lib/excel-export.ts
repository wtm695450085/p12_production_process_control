import type { DocumentMeta, DocumentSymbol } from "./types";

export interface ExportField {
  label: string;
  value: string;
}

interface FormulaRow {
  label: string;
  value?: number | string;
  unit?: string;
  formula?: string;
  explanation?: string;
}

const costFormula = (): FormulaRow[] => [
  { label:"Waga brutto",value:22,unit:"g",explanation:"Waga jednej sztuki wraz z odpadem technologicznym." },
  { label:"Cena receptury",value:16.82,unit:"zł/kg" },
  { label:"Koszt materiału",formula:"=B2/1000*B3",unit:"zł/szt.",explanation:"waga brutto / 1000 × cena receptury" },
  { label:"Dozowanie barwnika",value:2.5,unit:"%" },
  { label:"Cena barwnika",value:42,unit:"zł/kg" },
  { label:"Koszt barwnika",formula:"=B2/1000*B5/100*B6",unit:"zł/szt." },
  { label:"Stawka maszyny",value:95,unit:"zł/h" },
  { label:"Czas cyklu",value:32,unit:"s" },
  { label:"Krotność formy",value:2,unit:"szt./cykl" },
  { label:"Koszt maszyny",formula:"=B8/3600*B9/B10",unit:"zł/szt." },
  { label:"Koszt bezpośredni",formula:"=SUM(B4,B7,B11)",unit:"zł/szt." },
  { label:"Brakowość",value:3,unit:"%" },
  { label:"Koszt jednostkowy",formula:"=B12/(1-B13/100)",unit:"zł/szt.",explanation:"koszt bezpośredni / (1 − brakowość)" },
  { label:"Cena sprzedaży",value:1.15,unit:"zł/szt." },
  { label:"Marża jednostkowa",formula:"=B15-B14",unit:"zł/szt." },
  { label:"Narzut",formula:"=B16/B14",unit:"%",explanation:"marża / koszt jednostkowy" },
  { label:"Wydajność",formula:"=3600/B9*B10",unit:"szt./h" },
  { label:"Marża na maszynogodzinę",formula:"=B16*B18",unit:"zł/h" },
];

function formulaRows(symbol: DocumentSymbol): FormulaRow[] {
  if (["KP","AK","RKR","ALR","FZ"].includes(symbol)) return costFormula();
  if (["RZ","RN","PK"].includes(symbol)) return [
    {label:"Sztuki dobre",value:1500,unit:"szt."},{label:"Sztuki wadliwe",value:318,unit:"szt."},
    {label:"Razem wyprodukowane",formula:"=SUM(B2:B3)",unit:"szt."},{label:"Brakowość",formula:"=B3/B4",unit:"%"},
    {label:"Czas cyklu",value:39,unit:"s"},{label:"Krotność",value:2,unit:"szt./cykl"},
    {label:"Wydajność rzeczywista",formula:"=3600/B6*B7",unit:"szt./h"},{label:"Czas produkcji",formula:"=B4/B8",unit:"h"},
    {label:"Przezbrojenie",value:4.5,unit:"h"},{label:"Czas łączny",formula:"=SUM(B9:B10)",unit:"h"},
  ];
  if (["ZK","ZP","PZL"].includes(symbol)) return [
    {label:"Ilość zamówiona",value:5000,unit:"szt."},{label:"Ilość dobra",value:4720,unit:"szt."},
    {label:"Ilość wadliwa",value:768,unit:"szt."},{label:"Brakuje do zamówienia",formula:"=MAX(0;B2-B3)",unit:"szt."},
    {label:"Wykonanie zlecenia",formula:"=B3/B2",unit:"%"},{label:"Brakowość",formula:"=B4/(B3+B4)",unit:"%"},
    {label:"Cena jednostkowa",value:1.15,unit:"zł/szt."},{label:"Wartość dobrych sztuk",formula:"=B3*B8",unit:"zł"},
  ];
  if (["WP","TPP"].includes(symbol)) return [
    {label:"Ilość",value:5000,unit:"szt."},{label:"Cykl",value:32,unit:"s"},{label:"Krotność",value:2,unit:"szt./cykl"},
    {label:"Wydajność",formula:"=3600/B3*B4",unit:"szt./h"},{label:"Czas produkcji",formula:"=B2/B5",unit:"h"},
    {label:"Przezbrojenie",value:3,unit:"h"},{label:"Łączne obciążenie planu",formula:"=SUM(B6:B7)",unit:"h"},
  ];
  if (["KF","ZAF","PSF"].includes(symbol)) return [
    {label:"Licznik przed produkcją",value:412000,unit:"cykli"},{label:"Dobre sztuki",value:4720,unit:"szt."},
    {label:"Krotność formy",value:2,unit:"szt./cykl"},{label:"Cykle wykonane",formula:"=ROUNDUP(B3/B4;0)",unit:"cykli"},
    {label:"Licznik po produkcji",formula:"=SUM(B2,B5)",unit:"cykli"},{label:"Próg przeglądu",value:420000,unit:"cykli"},
    {label:"Cykle do przeglądu",formula:"=MAX(0;B7-B6)",unit:"cykli"},
  ];
  if (symbol === "KT") return [
    {label:"Czas wtrysku",value:4.5,unit:"s"},{label:"Docisk",value:4.5,unit:"s"},{label:"Chłodzenie",value:20,unit:"s"},
    {label:"Ruchy maszyny",value:3,unit:"s"},{label:"Cykl obliczony",formula:"=SUM(B2:B5)",unit:"s"},
    {label:"Krotność",value:2,unit:"szt./cykl"},{label:"Wydajność",formula:"=3600/B6*B7",unit:"szt./h"},
  ];
  if (["KL","SP"].includes(symbol)) return [
    {label:"Sztuk w kartonie",value:500,unit:"szt."},{label:"Kartonów na warstwę",value:8,unit:"szt."},
    {label:"Liczba warstw",value:5,unit:"warstw"},{label:"Sztuk na palecie",formula:"=PRODUCT(B2:B4)",unit:"szt."},
    {label:"Waga produktu",value:18,unit:"g/szt."},{label:"Masa produktu na palecie",formula:"=B5*B6/1000",unit:"kg"},
    {label:"Wysokość kartonu",value:250,unit:"mm"},{label:"Wysokość palety",value:144,unit:"mm"},
    {label:"Wysokość całkowita",formula:"=B8*B4+B9",unit:"mm"},{label:"Limit wysokości",value:1800,unit:"mm"},
    {label:"Kontrola limitu",formula:"=IF(B10<=B11,\"ZGODNA\",\"PRZEKROCZONA\")"},
  ];
  if (["ZM","PZ","WZ"].includes(symbol)) return [
    {label:"Stan fizyczny",value:420,unit:"kg"},{label:"Rezerwacje",value:126,unit:"kg"},
    {label:"Stan dostępny",formula:"=B2-B3",unit:"kg"},{label:"Zapotrzebowanie zlecenia",value:110,unit:"kg"},
    {label:"Niedobór",formula:"=MAX(0;B5-B4)",unit:"kg"},{label:"Stan po wydaniu",formula:"=B2-B5",unit:"kg"},
    {label:"Cena jednostkowa",value:19.4,unit:"zł/kg"},{label:"Wartość wydania",formula:"=B5*B8",unit:"zł"},
  ];
  return [
    {label:"Termin płatności",value:30,unit:"dni"},{label:"Wartość zamówień",value:12500,unit:"zł"},
    {label:"Rabat klienta",value:2,unit:"%"},{label:"Wartość po rabacie",formula:"=B3*(1-B4/100)",unit:"zł"},
  ];
}

export async function exportDocumentToExcel(meta: DocumentMeta, title: string, fields: ExportField[]) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const dataRows = [
    ["DOKUMENT", title],["Numer",meta.number],["Symbol",meta.symbol],["Status",meta.status.toUpperCase()],
    ["Autor",meta.author],["Rola",meta.authorRole],["Data",meta.date],["Zmiana",meta.shift??"—"],["Powiązane zlecenie",meta.relatedOrderId??"—"],
    [],["POLA DOKUMENTU","WARTOŚĆ"],...fields.map(field=>[field.label,field.value]),
  ];
  const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);
  dataSheet["!cols"]=[{wch:28},{wch:70}];
  XLSX.utils.book_append_sheet(workbook,dataSheet,"Dokument");

  const rows=formulaRows(meta.symbol);
  const calcSheet=XLSX.utils.aoa_to_sheet([["Składnik","Wartość","Jednostka","Jak jest liczone","Dokument",meta.number]]);
  rows.forEach((row,index)=>{
    const excelRow=index+2;
    XLSX.utils.sheet_add_aoa(calcSheet,[[row.label,row.value??null,row.unit??"",row.explanation??""]],{origin:`A${excelRow}`});
    if(row.formula) calcSheet[`B${excelRow}`]={t:"n",f:row.formula.slice(1),v:0};
  });
  calcSheet["!cols"]=[{wch:32},{wch:18},{wch:16},{wch:58}];
  XLSX.utils.book_append_sheet(workbook,calcSheet,"Obliczenia");

  const metaSheet=XLSX.utils.aoa_to_sheet([
    ["METRYKA I AUDYT",""],["Eksport wygenerowany",new Date().toISOString()],["Dokument źródłowy",meta.number],
    ["Autor dokumentu",meta.author],["Status",meta.status],["Moduł",meta.moduleId],["Informacja","Komórki w arkuszu „Obliczenia” zawierają aktywne formuły Excela. Zmiana danych wejściowych powoduje ponowne przeliczenie."],
  ]);
  metaSheet["!cols"]=[{wch:28},{wch:95}];
  XLSX.utils.book_append_sheet(workbook,metaSheet,"Metryka");
  XLSX.writeFile(workbook,`${meta.number.replaceAll("/","-")}.xlsx`,{compression:true});
}
