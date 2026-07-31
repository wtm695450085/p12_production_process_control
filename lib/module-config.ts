import type { DocumentSymbol, ModuleId } from "./types";

/** Zakładka raportu właścicielskiego w module 9 — widoczna tylko dla właściciela. */
export const OWNER_REPORT_TAB = "wlascicielski";

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  shortName: string;
  group: "DANE PODSTAWOWE" | "PLANOWANIE" | "WYKONANIE" | "WNIOSKI";
  description: string;
  documents: { symbol: DocumentSymbol; name: string }[];
  incoming: ModuleId[];
  outgoing: ModuleId[];
  tabs: { id: string; label: string }[];
}

export const moduleConfigs: Record<ModuleId, ModuleConfig> = {
  1: {
    id: 1, name: "Kartoteka i kalkulacja", shortName: "Kartoteka", group: "DANE PODSTAWOWE",
    description: "Jedno źródło prawdy o klientach, produktach i kosztach. Łączy założenia technologiczne z cenami zakupowymi i rzeczywistym wynikiem zakończonej produkcji.",
    documents: [{ symbol: "KK", name: "Karta klienta" }, { symbol: "KP", name: "Karta produktu" }, { symbol: "AK", name: "Arkusz kalkulacyjny" }],
    incoming: [3, 8], outgoing: [2, 3, 4, 5, 6, 7, 8, 9],
    tabs: [{ id: "kartoteka", label: "Kartoteka" }, { id: "kalkulacja", label: "Kalkulacja" }, { id: "klienci", label: "Klienci" }],
  },
  2: {
    id: 2, name: "Zlecenia produkcyjne", shortName: "Zlecenia", group: "PLANOWANIE",
    description: "Prowadzi zamówienie klienta od przyjęcia do zatwierdzonego rozliczenia. Każde zlecenie wskazuje produkt, kolory, maszynę, formę, technologię i logistykę.",
    documents: [{ symbol: "ZK", name: "Zamówienie klienta" }, { symbol: "ZP", name: "Zlecenie produkcyjne" }, { symbol: "PZL", name: "Protokół zatwierdzenia" }],
    incoming: [1], outgoing: [3, 4, 5, 6, 7, 8],
    tabs: [{ id: "zamowienia", label: "Zamówienia" }, { id: "zlecenia", label: "Zlecenia" }, { id: "szarze", label: "Szarże produkcyjne" }, { id: "zatwierdzanie", label: "Zatwierdzanie" }],
  },
  3: {
    id: 3, name: "Raport zmianowy i koszt rzeczywisty", shortName: "Raport i koszt", group: "WYKONANIE",
    description: "Zbiera dane bezpośrednio z hali i pokazuje, ile produkcja kosztowała naprawdę. Raport operatora zamyka pętlę kosztową i uruchamia aktualizacje w pięciu modułach.",
    documents: [{ symbol: "RZ", name: "Raport zmianowy" }, { symbol: "RN", name: "Raport nastawiacza" }, { symbol: "PK", name: "Protokół korekty" }, { symbol: "RKR", name: "Rozliczenie kosztu" }],
    incoming: [1, 2], outgoing: [1, 4, 5, 6, 8, 9],
    tabs: [{ id: "operator", label: "Panel operatora" }, { id: "nastawiacz", label: "Nastawiacz" }, { id: "korekta", label: "Korekta" }, { id: "koszt", label: "Koszt rzeczywisty" }, { id: "historia", label: "Historia produkcji" }],
  },
  4: {
    id: 4, name: "Plan produkcyjny", shortName: "Plan", group: "PLANOWANIE",
    description: "Układa zlecenia na osiach czasu maszyn i uwzględnia przezbrojenia. Postęp raportowany na hali koryguje przewidywany termin zakończenia.",
    documents: [{ symbol: "WP", name: "Wpis planu" }, { symbol: "TPP", name: "Tygodniowy plan produkcji" }],
    incoming: [2, 3, 5], outgoing: [3, 5, 8],
    tabs: [{ id: "tydzien", label: "Plan tygodniowy" }, { id: "rezerwacje", label: "Rezerwacje" }, { id: "wydruk", label: "Wydruk TPP" }],
  },
  5: {
    id: 5, name: "Karta formy", shortName: "Formy", group: "DANE PODSTAWOWE",
    description: "Traktuje formę jak majątek: przechowuje jej paszport, licznik cykli i historię awarii. Status formy natychmiast wpływa na możliwość realizacji planu.",
    documents: [{ symbol: "KF", name: "Karta formy" }, { symbol: "ZAF", name: "Zgłoszenie awarii" }, { symbol: "PSF", name: "Protokół serwisu" }],
    incoming: [2, 3, 4], outgoing: [4, 6],
    tabs: [{ id: "formy", label: "Rejestr form" }, { id: "awarie", label: "Awarie" }, { id: "serwis", label: "Narzędziownia" }],
  },
  6: {
    id: 6, name: "Karta technologiczna", shortName: "Technologia", group: "DANE PODSTAWOWE",
    description: "Przechowuje zatwierdzone parametry procesu dla pary produkt–maszyna. Każda produkcja zachowuje wersję karty, a uwagi z hali trafiają do historii.",
    documents: [{ symbol: "KT", name: "Karta technologiczna" }],
    incoming: [1, 2, 3, 5], outgoing: [2, 3, 9],
    tabs: [{ id: "karty", label: "Karty technologiczne" }, { id: "wersje", label: "Historia wersji" }, { id: "uwagi", label: "Uwagi z hali" }],
  },
  7: {
    id: 7, name: "Karta logistyczna", shortName: "Logistyka", group: "DANE PODSTAWOWE",
    description: "Definiuje pakowanie, paletyzację i operacje dodatkowe. Automatycznie liczy masę i wysokość palety oraz przekazuje zapotrzebowanie na opakowania.",
    documents: [{ symbol: "KL", name: "Karta logistyczna" }, { symbol: "SP", name: "Specyfikacja paletowa" }],
    incoming: [1, 2], outgoing: [8],
    tabs: [{ id: "karty", label: "Karty logistyczne" }, { id: "paleta", label: "Paletyzacja" }, { id: "operacje", label: "Operacje dodatkowe" }],
  },
  8: {
    id: 8, name: "Magazyn i rezerwacje", shortName: "Magazyn", group: "PLANOWANIE",
    description: "Kontroluje stany, rezerwacje i ceny rzeczywiste materiałów. Faktura zakupowa wraca do kalkulacji, a zatwierdzone zlecenie pozwala wystawić WZ.",
    documents: [{ symbol: "ZM", name: "Zapotrzebowanie materiałowe" }, { symbol: "PZ", name: "Przyjęcie zewnętrzne" }, { symbol: "WZ", name: "Wydanie zewnętrzne" }, { symbol: "FZ", name: "Faktura zakupu" }],
    incoming: [1, 2, 3, 7], outgoing: [1, 2, 9],
    tabs: [{ id: "stany", label: "Stany" }, { id: "rezerwacje", label: "Rezerwacje" }, { id: "dokumenty", label: "PZ / WZ" }, { id: "faktury", label: "Faktury zakupu" }],
  },
  9: {
    id: 9, name: "Analityka zarządcza", shortName: "Analityka", group: "WNIOSKI",
    description: "Łączy dane ze wszystkich modułów i pokazuje wynik według produktu, klienta i maszyny. Każdy alert prowadzi do dokumentów, z których powstał.",
    documents: [{ symbol: "ALR", name: "Alert rentowności" }],
    incoming: [1, 2, 3, 4, 5, 6, 7, 8], outgoing: [],
    tabs: [{ id: OWNER_REPORT_TAB, label: "Raport właścicielski" }, { id: "pulpit", label: "Pulpit" }, { id: "rentownosc", label: "Rentowność portfela" }, { id: "odchylenia", label: "Odchylenia" }],
  },
};

export const moduleOrder: (0 | ModuleId)[] = [0, 1, 5, 6, 7, 2, 4, 8, 3, 9];

/**
 * Zakładki widoczne dla danego użytkownika. Raport właścicielski pokazuje TKW
 * w rozbiciu na stawki i marżę na szarży, więc jest zarezerwowany dla właściciela.
 */
export function visibleModuleTabs(moduleId: ModuleId, owner: boolean) {
  return moduleConfigs[moduleId].tabs.filter((tab) => tab.id !== OWNER_REPORT_TAB || owner);
}

/**
 * Rozwiązuje zapisaną zakładkę na taką, którą użytkownik faktycznie może
 * zobaczyć — po zmianie roli nikt nie zostaje na ukrytym widoku.
 */
export function resolveModuleTab(moduleId: ModuleId, stored: string | undefined, owner: boolean): string {
  if (stored === "archiwum") return stored;
  const tabs = visibleModuleTabs(moduleId, owner);
  return tabs.some((tab) => tab.id === stored) ? stored! : tabs[0]!.id;
}
