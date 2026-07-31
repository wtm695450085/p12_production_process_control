# P12 — analiza rozwojowa demonstratora systemu zarządzania produkcją

**Wersja 2 — zaktualizowana 27 lipca 2026.** Ten dokument zastępuje wersję z
24 lipca 2026, 17:38, która opisywała stan *sprzed* przebudowy (pięć
ekranów, brak modułów 4–8). Tego samego wieczoru, między 17:38 a 20:19,
powstał 9-modułowy demonstrator opisany w `Stan_obecny_24_lipca.md`. Od
20:19 24 lipca do dziś (27 lipca) **żaden plik w repozytorium nie został
zmieniony** — zweryfikowano to po znacznikach czasu wszystkich plików
źródłowych. `Stan_obecny_24_lipca.md` opisuje więc bieżący stan aplikacji,
nie tylko stan historyczny.

Ta wersja dokumentu nie powtarza już opisu „czego brakuje do dziewięciu
modułów” — moduły istnieją i zostały zweryfikowane względem kodu. Zamiast
tego odpowiada na inne pytanie: **przebudowa naprawiła architekturę
informacyjną (menu, nazewnictwo, dokumenty, mapę systemu), ale czy naprawiła
też merytoryczne luki, które opisywała poprzednia wersja analizy** (pętla
kosztowa, ślad audytowy, edytowalność, wersjonowanie)? Odpowiedź, z
przywołaniem konkretnych miejsc w kodzie, jest w sekcji 3.

## 1. Metoda weryfikacji

Wykonano:

1. Porównanie znaczników czasu wszystkich plików źródłowych i dokumentów
   (`ls -la --time-style=full-iso`) — wszystkie noszą datę 24 lipca 2026,
   najpóźniej 20:19.
2. `npm run verify` — skrypt kontrolny formuł kosztowych: **0 błędów**,
   wszystkie wartości kontrolne (koszt jednostkowy, narzut, wydajność,
   marża/h dla 6 produktów; koszt rzeczywisty, odchylenie, wynik/szt.,
   suma waterfall dla 3 zleceń; scenariusz P-105) zgadzają się co do 4
   miejsca po przecinku.
3. `npx tsc --noEmit` — **0 błędów** trybu `strict`.
4. `npm run build` — build produkcyjny Next.js kończy się sukcesem,
   `output: "export"` generuje statyczny `out/` (143 kB strony głównej).
5. Punktowa weryfikacja danych seed względem opisu w `Stan_obecny_24_lipca.md`
   (9 modułów w `lib/module-config.ts`, 6 produktów, 3 klientów, 9 form,
   7 użytkowników w `lib/access-control.ts`) — zgodne.
6. Przegląd kodu (agent badawczy, 23 odczyty plików) sprawdzający punkt po
   punkcie, czy osiem konkretnych zastrzeżeń z poprzedniej wersji analizy
   zostało naprawionych, czy tylko rozproszonych po nowych ekranach.

Wniosek ogólny: **aplikacja jest technicznie zdrowa** (buduje się, typuje
się, liczy poprawnie) i **architektonicznie znacznie bogatsza** niż opisywała
to poprzednia wersja tej analizy. Nie jest to jednak to samo, co „luki
merytoryczne zostały zamknięte” — patrz sekcja 3.

## 2. Co przebudowa faktycznie naprawiła

To są realne, zweryfikowane w kodzie usprawnienia względem starej,
pięcioekranowej wersji:

- **Dziewięć nazwanych modułów** zamiast pięciu ekranów —
  `lib/module-config.ts:17-73` definiuje moduły 1–9 z grupami (DANE
  PODSTAWOWE / PLANOWANIE / WYKONANIE / WNIOski), dokładnie jak rekomendowała
  poprzednia analiza i jak wymaga `zakres_modulowy.docx`.
- **Encja klienta** — `Customer` (`lib/types.ts:184`), trzech klientów w
  seedzie, podwidok „Klienci” w module 1.
- **Katalog i trasy dokumentów** — `lib/document-routes.ts`,
  `DocumentSheet.tsx`, 22 typy dokumentów (KK, KP, AK, ZK, ZP, PZL, RZ, RN,
  PK, RKR, WP, TPP, KF, ZAF, PSF, KT, KL, SP, ZM, PZ, WZ, FZ, ALR) ze
  statusami ROBOCZY/ZŁOŻONY/ZATWIERDZONY/SKORYGOWANY.
- **Mapa systemu** (`SystemMap.tsx`) — interaktywny SVG z czterema warstwami
  i podświetleniem pętli kosztowej.
- **Realnie działająca kontrola dostępu** — to jedyny z ośmiu starych
  zastrzeżeń, który został naprawiony w pełni, nie częściowo.
  `AccessGate.tsx:9-11` faktycznie blokuje wejście w moduł (`canView`), a
  `lib/access-control.ts:53-63` (`canEditModule`, `canEditDocument`) steruje
  atrybutem `disabled` na przyciskach w całym `ModuleScreens.tsx` (np. linie
  63, 77, 79, 124). Przełączenie „Wciel się w Operatora” realnie wyłącza
  akcje niedostępne tej roli — to nie jest opis w danych seed, to działający
  mechanizm.
- **Eksport do Excela** (`lib/excel-export.ts`) — prawdziwe pliki `.xlsx` z
  arkuszami Dokument/Obliczenia/Metryka i aktywnymi formułami.
- **Archiwum dokumentów** (`DocumentArchive.tsx`, `lib/archived-documents.ts`)
  i **szarże produkcyjne z identyfikowalnością** (`ProductionBatches.tsx`,
  `lib/production-batches.ts`) — nowa, wcześniej nieistniejąca głębia danych.
- **Karta formy, karta technologiczna (z wersjami), karta logistyczna,
  plan produkcyjny, magazyn** — wszystkie jako realne, przełączalne ekrany
  z własnymi danymi seed, nie jako luki opisane tylko tekstowo.

To jest dokładnie to, co poprzednia wersja analizy nazywała „przebudową
architektury informacyjnej” (sekcja 8 starej wersji) — i zostało zrobione
sumiennie.

## 3. Co przebudowa NIE naprawiła — te same problemy, więcej ekranów

Poprzednia wersja tej analizy (i wcześniej `TODO.md` z 23 lipca) wskazywała
osiem konkretnych, merytorycznych słabości starego demo. Poniżej — z
odwołaniami do plików i linii — status każdej z nich po przebudowie.

### 3.1. Raport zmianowy nadal nie zasila rozliczenia — **nadal aktualne**

`submitLeadShiftReport` (`store/useDemoStore.ts:236-261`) po złożeniu
raportu ustawia wyłącznie flagi kosmetyczne: `moldF001InService`,
`technologyNotes`, `planSetupHours`, `materialConsumedKg`, oraz wypełnia
skrzynki „DOKUMENT PRZEKAZANY”. Rzeczywista matematyka rozliczenia,
`computeOrderSettlement` (`lib/calculations.ts:119-221`), wywoływana z
`RozliczenieScreen.tsx:25-27` i `ModuleScreens.tsx:132`, liczy wyłącznie na
podstawie zaplombowanych pól seed (`actualCycleTimeS`, `actualScrapRatePct`,
`setupTimeH` w `productionOrders`). Flagi ustawiane przez „złożenie
raportu” nigdy tam nie trafiają.

Innymi słowy: efektowny panel „Złóż raport i przekaż do 5 modułów” ze
scenariusza sprzedażowego (`SCENARIUSZ.md`) działa tylko dlatego, że
prowadzi przez **jedną, zaszytą na sztywno ścieżkę** (`RZ/2026/0431` →
zmiany widoczne w modułach 4/5/6/8). Gdyby operator w demo wpisał inne
liczby niż scenariuszowe, rozliczenie kosztu rzeczywistego by się nie
zmieniło — bo go w ogóle nie czyta.

### 3.2. Brak śladu audytowego — **nadal aktualne**

`meta()` (`components/screens/ModuleScreens.tsx:136-138`) zwraca datę na
sztywno (`date: "2026-06-16"`) niezależnie od tego, kto i kiedy faktycznie
kliknął. `submitLeadShiftReport`, `finalizeCostSettlement`,
`applyPurchaseInvoice` nigdy nie zapisują `activeUserId` (który już istnieje
w store — `useDemoStore.ts:61,120`) ani znacznika czasu przy złożeniu czy
zatwierdzeniu dokumentu. `submitShiftReport`
(`store/useDemoStore.ts:207-234`) w dalszym ciągu czyści pole `notes:""`
po złożeniu — uwaga operatora nadal ginie. Metadane w archiwum
(`lib/archived-documents.ts:33-59`) są generowane proceduralnie z opisów
seed, nie z realnych akcji użytkownika.

### 3.3. Tryb „przestój” bez wymaganego pola przyczyny/czasu — **nadal aktualne**

`components/screens/RaportZmianowyScreen.tsx:153-164` renderuje dodatkowe pole tylko dla
`workMode==="przezbrojenie"` (liczba godzin przezbrojenia). Dla
`"przestoj"` nie ma żadnej odpowiadającej gałęzi — ani wymaganego opisu, ani
czasu trwania.

### 3.4. Wpisany czas przezbrojenia nie wpływa na rozliczenie — **nadal aktualne**

`form.setupHours` wpisywane w panelu operatora nigdy nie jest odczytywane
przez `computeOrderSettlement`, który zamiast tego bierze pole seed
`order.setupTimeH` (`lib/calculations.ts:131`).

### 3.5. Globalny suwak alertu rentowności vs. próg per-produkt — **częściowo naprawione**

`sliderStatus()` (`lib/calculations.ts:103-111`, progi 10%/25%) pozostał
bez zmian i nadal steruje ekranem Kalkulacji modułu 1
(`KalkulacjaScreen.tsx:32`) oraz tabelą produktów (`ProduktyScreen.tsx:48`).
Nowość: zakładka „Odchylenia” modułu 9 (`ModuleScreens.tsx:132`) i
`orderStatus()` (`calculations.ts:113-117`) faktycznie liczą status
per-zlecenie — to jest realna poprawa. Ale stary, globalny mechanizm nie
został ani zastąpiony, ani zsynchronizowany z nowym — oba istnieją obok
siebie i mogą pokazywać niespójne oceny tego samego produktu.

### 3.6. Brak edycji karty produktu — **nadal aktualne**

`ProduktyScreen.tsx` nie zawiera ani jednego `input`/`onChange` (potwierdzone
przeszukaniem pliku). Karta klienta i karta produktu w module 1 są
wyłącznie do odczytu, mimo że dokument źródłowy (`zakres_modulowy.docx`)
i poprzednia wersja tej analizy wskazywały edycję jako część modułu 1.

### 3.7. Brak wersjonowania kalkulacji — **częściowo naprawione**

Wersjonowanie zostało dodane, ale tylko dla karty technologicznej —
`TechnologyCardVersion` (`lib/types.ts:275-285`), zakładka „Historia wersji”
modułu 6. Analogicznego mechanizmu dla arkusza kalkulacyjnego (`AK`) nie ma
— brak typu i brak historii. Kalkulacja P-105 owszem zmienia status na
„NIEAKTUALNA” po zatwierdzeniu RKR, ale to pojedyncza flaga, nie wersja z
historią i porównaniem.

### 3.8. Techniczny dług: stary `ScreenId` obok nowego `ModuleId` — **częściowo naprawione**

`store/useDemoStore.ts:6` nadal definiuje
`export type ScreenId = 1 | 2 | 3 | 4 | 5;` i jest on nadal używany (np.
`setScreen(1)` w `KalkulacjaScreen.tsx:152`), mimo że obok powstał właściwy
model modułowy (`ModuleId`, `lib/types.ts:98`, `moduleTabs`,
`useDemoStore.ts:63-64,121-124`). Stary typ nie przeszkadza użytkownikowi
demo, ale utrudnia dalszy rozwój — dwa równoległe systemy nawigacji w jednym
store.

### 3.9. Podsumowanie tabelaryczne

| # | Zastrzeżenie sprzed przebudowy | Status po przebudowie |
|---|---|---|
| 1 | Raport zmianowy nie zasila rozliczenia | **nadal aktualne** |
| 2 | Brak śladu audytowego (autor/czas), uwagi giną | **nadal aktualne** |
| 3 | „Przestój” bez wymaganej przyczyny/czasu | **nadal aktualne** |
| 4 | Czas przezbrojenia z formularza nie liczy się | **nadal aktualne** |
| 5 | Globalny suwak alertu zamiast progu per-produkt | częściowo — dodano równoległy mechanizm, stary nie zniknął |
| 6 | Brak edycji karty produktu/klienta | **nadal aktualne** |
| 7 | Brak wersjonowania kalkulacji | częściowo — wersjonowanie jest, ale tylko dla technologii |
| 8 | Płaski `ScreenId`, brak modelu modułowego | częściowo — nowy model dodany, stary nie usunięty |
| — | Kontrola dostępu tylko deklaratywna | **w pełni naprawione** — realnie blokuje UI |

Ogólny wzorzec: przebudowa skupiła się niemal wyłącznie na **warstwie
prezentacji i nawigacji** (dokładnie to, co rekomendowała poprzednia wersja
analizy w sekcjach 8 i 25) i zrobiła to solidnie. Nie dotknęła jednak
**warstwy przepływu danych** — te same „na sztywno zaszyte” wartości seed,
które napędzały pięć starych ekranów, dziś napędzają dziewięć. Jedyny
wyjątek to kontrola dostępu, która jest realnie egzekwowana.

## 4. Ryzyko dla prezentacji sprzedażowej

To rozróżnienie ma praktyczne znaczenie tylko poza kontrolowanym
scenariuszem z `SCENARIUSZ.md`. Dopóki prezentujący trzyma się zlecenia
`ZP/2026/218` i wartości `RZ/2026/0431`, „zamknięcie pętli kosztowej”
wygląda i działa przekonująco, bo cały efekt jest przygotowany jako
kontrolowany, ale statyczny przeskok stanu (flagi `moldF001InService`,
`stale` itd.), a nie jako obliczenie na podstawie wpisanych liczb.

Ryzyko pojawia się, gdy:

- odbiorca (zwłaszcza techniczny, np. dyrektor IT klienta) poprosi o
  wpisanie **innych** liczb w panelu operatora — rozliczenie się nie
  zmieni, bo go nie czyta;
- odbiorca zapyta „kto i kiedy to zatwierdził” — data będzie zawsze taka
  sama (16.06.2026), niezależnie od tego, kiedy demo jest pokazywane;
- odbiorca kliknie „Zatwierdź” dwa razy albo w innej kolejności niż w
  scenariuszu — może zobaczyć niespójny stan (np. alert rentowności z
  modułu 9 pokazujący inny wniosek niż suwak w module 1).

Nie jest to problem krytyczny dla obecnego, jednego, ok. 8–10-minutowego
scenariusza sprzedażowego — ale ogranicza, jak daleko można pozwolić
odbiorcy „samodzielnie poklikać”.

## 5. Zgodność z `zakres_modulowy.docx`

W przeciwieństwie do poprzedniej wersji tej analizy, gdzie 6 z 9 modułów
było oznaczonych jako „brak” lub „szczątkowe”, obecny stan pokrywa
**wszystkie dziewięć modułów jako osobne, nazwane ekrany z własnymi
formularzami i danymi**. Pozostałe realne luki względem dokumentu
źródłowego to głównie kwestie z sekcji 3 powyżej (edytowalność, audyt,
rzeczywiste powiązanie raport→koszt), a nie brakujące ekrany.

Moduł 0 (Rozpoznanie w zakładzie) pozostaje poprawnie potraktowany jako
etap przedwdrożeniowy, nie jako zakładka — reprezentuje go wyłącznie
informacyjna „Mapa systemu”, zgodnie z rekomendacją poprzedniej wersji
analizy.

## 6. Rekomendacje na kolejny etap rozwoju

Poniżej priorytety pod kątem *dalszego rozwoju demonstratora* (nie
wdrożenia produkcyjnego — to osobny próg, patrz `README.md` i sekcja 32
poprzedniej wersji tej analizy, wciąż aktualna).

### 6.1. Zrobić najpierw — podnosi wiarygodność demo przy realnej interakcji

1. **Realnie połączyć panel operatora ze zleceniem `ZP/2026/218`.**
   Nie trzeba uogólniać na wszystkie zlecenia — wystarczy, żeby wpisane w
   `RaportZmianowyScreen` wartości (`actualCycleTimeS`, `actualScrapRatePct`,
   `setupHours`) faktycznie trafiały do stanu czytanego przez
   `computeOrderSettlement`, zamiast osobnych flag kosmetycznych. To
   zamyka najważniejszą różnicę między „wygląda jak system” a „jest
   systemem” na golden path.
2. **Prawdziwy znacznik autor/czas.** `activeUserId` już istnieje w
   store — wystarczy, żeby `meta()` i akcje zatwierdzające go czytały
   zamiast zwracać sztywną datę `2026-06-16`. Niewielka zmiana, duży efekt
   wiarygodności przy pytaniu „kto to zatwierdził”.
3. **Wymagane pole przyczyny/czasu dla „przestoju”** w
   `components/screens/RaportZmianowyScreen.tsx` — analogicznie do już istniejącego pola dla
   przezbrojenia.

### 6.2. Zrobić w drugiej kolejności — porządkuje spójność

4. **Zunifikować alert rentowności.** Zdecydować: albo globalny suwak
   (`sliderStatus`) zostaje zastąpiony logiką per-zlecenie
   (`orderStatus`), albo jawnie opisać różnicę w UI („scenariusz
   portfelowy” vs. „ocena zlecenia”), żeby nie wyglądały jak dwa
   niezależne, potencjalnie sprzeczne źródła prawdy.
5. **Wersjonowanie kalkulacji (AK)** analogiczne do już istniejącego
   `TechnologyCardVersion` — szczególnie ważne, bo scenariusz sprzedażowy
   explicite pokazuje przejście kalkulacji ze statusu AKTUALNA na
   NIEAKTUALNA; wersja z historią zamiast pojedynczej flagi byłaby
   mocniejszym dowodem koncepcji.
6. **Usunąć legacy `ScreenId`** ze `store/useDemoStore.ts` na rzecz
   istniejącego już `ModuleId`/`moduleTabs` — czysto porządkowe, ale
   zmniejsza ryzyko rozjazdu przy kolejnych zmianach nawigacji.

### 6.3. Rozważyć, jeśli demo ma być używane bez stałej opieki prezentera

7. **Edytowalność karty produktu/klienta** — obecnie tylko odczyt.
   Potrzebne, jeśli klient ma sam „poklikać” demo bez skryptu.
8. **Trwałość stanu (localStorage)** — obecnie każde odświeżenie strony
   resetuje demo. To świadome uproszczenie (`TODO.md`), zasadne dla
   4–10-minutowej rozmowy sprzedażowej z jednym resetem, ale ograniczające
   przy dłuższym, samodzielnym używaniu.

### 6.4. Nieaktualne materiały do uporządkowania

`TODO.md` (ostatnia zmiana 23 lipca, przed przebudową) wciąż opisuje starą,
pięcioekranową wersję („Ekran 3”, „Ekran 4”) — warto go zaktualizować albo
oznaczyć jako historyczny przy okazji kolejnych prac, żeby nie wprowadzał w
błąd. `README.md` i `SCENARIUSZ.md` są już aktualne (zmienione podczas
przebudowy 24 lipca, poprawnie opisują 9 modułów).

## 7. Wniosek

Między napisaniem pierwszej wersji tej analizy (24 lipca, 17:38) a dziś
zmieniło się dokładnie jedno: **cała rekomendowana w niej przebudowa
architektury informacyjnej została wykonana tego samego wieczoru** — 9
modułów, dokumenty, mapa systemu, kontrola dostępu, archiwum, eksport do
Excela. Od 20:19 24 lipca nic więcej się nie zmieniło; `Stan_obecny_24_lipca.md`
trafnie opisuje aplikację taką, jaka jest dziś, i ten opis został
potwierdzony budowaniem, typowaniem i testem formuł.

To, co pozostało z poprzedniej analizy jako nadal aktualne, nie dotyczy już
brakujących ekranów — dotyczy tego, że **dane wciąż płyną tylko w jedną
stronę wewnątrz jednej, zaszytej na sztywno ścieżki demonstracyjnej**, a nie
faktycznie zamykają pętlę dla dowolnie wpisanych wartości. Dla obecnego,
jednego kontrolowanego scenariusza sprzedażowego to nie jest problem —
demo robi dokładnie to, do czego zostało zaprojektowane. Staje się
problemem tylko w momencie, gdy projekt ma być rozwijany dalej w stronę
czegoś, co odbiorca może samodzielnie eksplorować, edytować lub w co można
wpisać własne liczby — a to jest dokładnie kierunek, w którym zgodnie z
zapowiedzią będzie teraz rozwijany.
