import type { DocumentRoute } from "./types";

export const documentRoutes: DocumentRoute[] = [
  {
    symbol: "ZK",
    documentName: "Zamówienie klienta",
    sourceModuleId: 2,
    targets: [
      { moduleId: 2, effect: "Tworzy zlecenie produkcyjne." },
      { moduleId: 8, effect: "Generuje zapotrzebowanie materiałowe." },
    ],
  },
  {
    symbol: "ZP",
    documentName: "Zlecenie produkcyjne",
    sourceModuleId: 2,
    targets: [
      { moduleId: 4, effect: "Tworzy kafelek zlecenia w planie." },
      { moduleId: 5, effect: "Rezerwuje właściwą formę." },
      { moduleId: 6, effect: "Wskazuje obowiązującą wersję karty technologicznej." },
      { moduleId: 7, effect: "Pobiera kartę logistyczną produktu." },
      { moduleId: 8, effect: "Rezerwuje materiały i opakowania." },
    ],
  },
  {
    symbol: "RZ",
    documentName: "Raport zmianowy operatora",
    sourceModuleId: 3,
    targets: [
      { moduleId: 3, effect: "Aktualizuje koszt rzeczywisty zlecenia." },
      { moduleId: 4, effect: "Koryguje czas przezbrojenia i przewidywany koniec." },
      { moduleId: 5, effect: "Podbija licznik cykli formy." },
      { moduleId: 6, effect: "Dopisuje uwagi procesowe do karty technologicznej." },
      { moduleId: 8, effect: "Zdejmuje zużyty materiał ze stanu." },
    ],
  },
  {
    symbol: "RN",
    documentName: "Raport nastawiacza",
    sourceModuleId: 3,
    targets: [
      { moduleId: 6, effect: "Przekazuje uwagi procesowe technologowi i następnej zmianie." },
    ],
  },
  {
    symbol: "ZAF",
    documentName: "Zgłoszenie awarii formy",
    sourceModuleId: 5,
    targets: [
      { moduleId: 5, effect: "Zmienia status formy na SERWIS." },
      { moduleId: 4, effect: "Oznacza plan jako zagrożony." },
    ],
  },
  {
    symbol: "PK",
    documentName: "Protokół korekty",
    sourceModuleId: 3,
    targets: [
      { moduleId: 3, effect: "Koryguje ilości i ponownie przelicza koszt." },
      { moduleId: 9, effect: "Aktualizuje analitykę z zachowaniem śladu korekty." },
    ],
  },
  {
    symbol: "RKR",
    documentName: "Rozliczenie kosztu rzeczywistego",
    sourceModuleId: 3,
    targets: [
      { moduleId: 1, effect: "Oznacza kalkulację jako nieaktualną i podaje sugerowaną cenę." },
      { moduleId: 9, effect: "Zasila analitykę kosztu i rentowności." },
    ],
  },
  {
    symbol: "PZL",
    documentName: "Protokół zatwierdzenia zlecenia",
    sourceModuleId: 2,
    targets: [{ moduleId: 8, effect: "Uprawnia magazyn do wystawienia dokumentu WZ." }],
  },
  {
    symbol: "FZ",
    documentName: "Faktura zakupu",
    sourceModuleId: 8,
    targets: [
      { moduleId: 1, effect: "Aktualizuje cenę materiału i przelicza marże." },
      { moduleId: 9, effect: "Aktualizuje analitykę wpływu cen zakupowych." },
    ],
  },
  {
    symbol: "PSF",
    documentName: "Protokół serwisu formy",
    sourceModuleId: 5,
    targets: [
      { moduleId: 5, effect: "Przywraca formie status SPRAWNA." },
      { moduleId: 4, effect: "Zwalnia blokadę formy w planie." },
    ],
  },
];
