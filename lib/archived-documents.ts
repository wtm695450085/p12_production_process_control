import type { ArchivedDocument, DocumentStatus, DocumentSymbol, ModuleId } from "./types";

const definitions: { symbol: DocumentSymbol; moduleId: ModuleId; title: string; author: string; role: string; subjects: string[] }[] = [
  { symbol:"KK",moduleId:1,title:"Karta klienta",author:"Karolina Majewska",role:"handlowiec",subjects:["PetLine Polska","Animal House","ZooMarket Dystrybucja"] },
  { symbol:"KP",moduleId:1,title:"Karta produktu",author:"Marek Lewandowski",role:"technolog",subjects:["P-101 Miska 900 ml","P-102 Szarpak Rope","P-105 Rączka RAIS 2"] },
  { symbol:"AK",moduleId:1,title:"Arkusz kalkulacyjny",author:"Jakub Majchrzak",role:"właściciel",subjects:["P-101 kalkulacja bazowa","P-104 rewizja kosztu","P-106 aktualizacja stawki"] },
  { symbol:"ZK",moduleId:2,title:"Zamówienie klienta",author:"Karolina Majewska",role:"handlowiec",subjects:["PetLine · pięć kolorów","Animal House · partia miesięczna","ZooMarket · dostawa pełnopaletowa"] },
  { symbol:"ZP",moduleId:2,title:"Zlecenie produkcyjne",author:"Piotr Wójcik",role:"kierownik produkcji",subjects:["P-101 · 8 000 szt.","P-102 · 7 500 szt.","P-104 · 50 000 szt."] },
  { symbol:"PZL",moduleId:2,title:"Protokół zatwierdzenia zlecenia",author:"Ewa Kamińska",role:"kontrola jakości",subjects:["Rozliczenie ilościowe P-101","Rozliczenie ilościowe P-102","Rozliczenie ilościowe P-106"] },
  { symbol:"RZ",moduleId:3,title:"Raport zmianowy operatora",author:"Zofia Kowalska",role:"operator",subjects:["Zmiana I · W4","Zmiana II · W2","Zmiana III · W5"] },
  { symbol:"RN",moduleId:3,title:"Raport nastawiacza",author:"Bartosz Wiśniewski",role:"nastawiacz",subjects:["Przezbrojenie W4/F-002","Ustawienie W3/F-003","Próba W5/F-004"] },
  { symbol:"PK",moduleId:3,title:"Protokół korekty",author:"Ewa Kamińska",role:"kontrola jakości",subjects:["Korekta braków P-102","Korekta czasu przestoju","Korekta rozchodu materiału"] },
  { symbol:"RKR",moduleId:3,title:"Rozliczenie kosztu rzeczywistego",author:"System P12",role:"system",subjects:["Koszt P-101 · luty","Koszt P-104 · marzec","Koszt P-106 · kwiecień"] },
  { symbol:"WP",moduleId:4,title:"Wpis planu produkcyjnego",author:"Piotr Wójcik",role:"kierownik produkcji",subjects:["W4 · tydzień 18","W2 · tydzień 20","W5 · tydzień 22"] },
  { symbol:"TPP",moduleId:4,title:"Tygodniowy plan produkcji",author:"Piotr Wójcik",role:"kierownik produkcji",subjects:["Plan tygodnia 17","Plan tygodnia 20","Plan tygodnia 23"] },
  { symbol:"KF",moduleId:5,title:"Karta formy",author:"Stanisław Kaczmarek",role:"narzędziownia",subjects:["F-001 przegląd karty","F-003 licznik okresowy","F-005 odbiór po serwisie"] },
  { symbol:"ZAF",moduleId:5,title:"Zgłoszenie awarii formy",author:"Anna Nowak",role:"operator",subjects:["F-001 wypychacz","F-003 odpowietrzenie","F-005 chłodzenie"] },
  { symbol:"PSF",moduleId:5,title:"Protokół serwisu formy",author:"Stanisław Kaczmarek",role:"narzędziownia",subjects:["Serwis F-001","Serwis F-003","Serwis F-005"] },
  { symbol:"KT",moduleId:6,title:"Karta technologiczna",author:"Marek Lewandowski",role:"technolog",subjects:["KT/P-102/W4 v1","KT/P-105/W4 v2","KT/P-106/W6 v1"] },
  { symbol:"KL",moduleId:7,title:"Karta logistyczna",author:"Iwona Król",role:"logistyka",subjects:["KL/P-101","KL/P-105","KL/P-106"] },
  { symbol:"SP",moduleId:7,title:"Specyfikacja paletowa",author:"Robert Dąbrowski",role:"magazyn",subjects:["Paleta P-101","Paleta P-102","Paleta P-105"] },
  { symbol:"ZM",moduleId:8,title:"Zapotrzebowanie materiałowe",author:"System P12",role:"system",subjects:["Materiały ZP/2026/044","Materiały ZP/2026/096","Materiały ZP/2026/139"] },
  { symbol:"PZ",moduleId:8,title:"Przyjęcie zewnętrzne",author:"Robert Dąbrowski",role:"magazynier",subjects:["Dostawa TPE-S 4055","Dostawa PP H734-52","Dostawa kartonów"] },
  { symbol:"WZ",moduleId:8,title:"Wydanie zewnętrzne",author:"Robert Dąbrowski",role:"magazynier",subjects:["Wysyłka PetLine","Wysyłka Animal House","Wysyłka ZooMarket"] },
  { symbol:"FZ",moduleId:8,title:"Faktura zakupu",author:"Beata Pawlak",role:"księgowość",subjects:["Polymer Trade","ColorChem Polska","Pack-System"] },
  { symbol:"ALR",moduleId:9,title:"Alert rentowności",author:"System P12",role:"system",subjects:["Odchylenie P-105","Spadek marży P-102","Wzrost kosztu P-106"] },
];

const dates = ["2026-01-16","2026-02-04","2026-02-27","2026-03-18","2026-04-09","2026-05-06","2026-05-28","2026-06-10"];
const orders = ["ZP/2026/044","ZP/2026/081","ZP/2026/096","ZP/2026/118","ZP/2026/139","ZP/2026/167","ZP/2026/205","ZP/2026/211"];
const statuses: DocumentStatus[] = ["zatwierdzony","zatwierdzony","skorygowany"];

export const archivedDocuments: ArchivedDocument[] = definitions.flatMap((definition, definitionIndex) =>
  Array.from({ length: 3 }, (_, index) => {
    const sequence = 100 + definitionIndex * 3 + index;
    const relatedOrderId = ["KK","KP","AK","KF","KT","KL","SP","FZ"].includes(definition.symbol)
      ? undefined
      : orders[(definitionIndex + index) % orders.length];
    return {
      meta: {
        id: `ARCH-${definition.symbol}-${sequence}`,
        symbol: definition.symbol,
        number: `${definition.symbol}/2026/${String(sequence).padStart(4,"0")}`,
        moduleId: definition.moduleId,
        author: index === 1 && definition.symbol === "RZ" ? "Anna Nowak" : definition.author,
        authorRole: definition.role,
        date: dates[(definitionIndex * 2 + index) % dates.length]!,
        status: statuses[index]!,
        shift: definition.symbol === "RZ" ? (["I","II","III"] as const)[index] : undefined,
        relatedOrderId,
      },
      title: definition.title,
      subject: definition.subjects[index]!,
      summary: `${definition.title} zarejestrowany w systemie, podpisany przez: ${index === 1 && definition.symbol === "RZ" ? "Anna Nowak" : definition.author}. Dokument zachowany wraz z metadanymi, statusem i trasą.`,
      amount: ["AK","RKR","FZ","ALR"].includes(definition.symbol) ? `${(1240 + sequence * 7.35).toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2})} zł` : undefined,
      sourceDocument: relatedOrderId,
    } satisfies ArchivedDocument;
  })
).sort((a,b) => b.meta.date.localeCompare(a.meta.date));
