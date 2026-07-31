export type Lang = "pl" | "en";

export const languages: { id: Lang; label: string; title: string }[] = [
  { id: "pl", label: "PL", title: "Polski" },
  { id: "en", label: "EN", title: "English" },
];

/**
 * Słownik PL → EN. Kluczem jest polski tekst źródłowy, dzięki czemu kod
 * pozostaje czytelny po polsku, a brak tłumaczenia degraduje się łagodnie —
 * ekran pokaże polski oryginał zamiast pustego miejsca albo klucza.
 *
 * Zdania budowane z liczb (opisy działań w raporcie właścicielskim) NIE są tu
 * tłumaczone — mają osobne warianty językowe w miejscu, gdzie powstają, bo
 * inaczej trzeba by sklejać fragmenty w kolejności właściwej dla jednego języka.
 */
const dictionary: Record<string, string> = {
  /* ── Powłoka aplikacji ─────────────────────────────────────────────── */
  "P12 · STEROWANIE PRODUKCJĄ": "P12 · PRODUCTION CONTROL",
  "obieg dokumentów · demo": "document flow · demo",
  "Klawisze 0–9 · M mapa · A dostęp": "Keys 0–9 · M map · A access",
  "Zarządzanie dostępem": "Access management",
  "Mapa systemu": "System map",
  "Reset demo": "Reset demo",
  Zresetowano: "Reset done",
  "Wciel się…": "Switch user…",
  "Wciel się": "Switch user",
  "Wciel się w użytkownika": "Impersonate user",
  "Język interfejsu": "Interface language",
  "SCENARIUSZ:": "SCENARIO:",
  "ZK/2026/077 → ZP/2026/218 · P-105 Rączka RAIS 2":
    "ZK/2026/077 → ZP/2026/218 · P-105 RAIS 2 handle",

  /* ── Grupy modułów i nagłówek ──────────────────────────────────────── */
  "DANE PODSTAWOWE": "MASTER DATA",
  PLANOWANIE: "PLANNING",
  WYKONANIE: "EXECUTION",
  WNIOSKI: "INSIGHTS",
  MODUŁ: "MODULE",
  "Gdzie jestem w systemie": "Where am I in the system",
  "Dokumenty w tym module": "Documents in this module",
  "Skąd przychodzą dane": "Where data comes from",
  "Dokąd wychodzą dane": "Where data goes",
  "Archiwum dokumentów": "Document archive",

  /* ── Moduły ────────────────────────────────────────────────────────── */
  "Kartoteka i kalkulacja": "Master data and costing",
  Kartoteka: "Master data",
  "Jedno źródło prawdy o klientach, produktach i kosztach. Łączy założenia technologiczne z cenami zakupowymi i rzeczywistym wynikiem zakończonej produkcji.":
    "A single source of truth about customers, products and costs. It links process assumptions to purchase prices and to the real result of finished production.",
  "Zlecenia produkcyjne": "Production orders",
  Zlecenia: "Orders",
  "Prowadzi zamówienie klienta od przyjęcia do zatwierdzonego rozliczenia. Każde zlecenie wskazuje produkt, kolory, maszynę, formę, technologię i logistykę.":
    "Takes a customer order from receipt to an approved settlement. Every order names the product, colours, machine, mould, process card and logistics card.",
  "Raport zmianowy i koszt rzeczywisty": "Shift report and actual cost",
  "Raport i koszt": "Report and cost",
  "Zbiera dane bezpośrednio z hali i pokazuje, ile produkcja kosztowała naprawdę. Raport operatora zamyka pętlę kosztową i uruchamia aktualizacje w pięciu modułach.":
    "Collects data straight from the shop floor and shows what production really cost. The operator report closes the cost loop and triggers updates in five modules.",
  "Plan produkcyjny": "Production plan",
  Plan: "Plan",
  "Układa zlecenia na osiach czasu maszyn i uwzględnia przezbrojenia. Postęp raportowany na hali koryguje przewidywany termin zakończenia.":
    "Lays orders out on machine timelines and accounts for changeovers. Progress reported on the floor corrects the expected completion date.",
  "Karta formy": "Mould card",
  Formy: "Moulds",
  "Traktuje formę jak majątek: przechowuje jej paszport, licznik cykli i historię awarii. Status formy natychmiast wpływa na możliwość realizacji planu.":
    "Treats the mould as an asset: it keeps the passport, the cycle counter and the failure history. Mould status immediately affects whether the plan can be executed.",
  "Karta technologiczna": "Process card",
  Technologia: "Process",
  "Przechowuje zatwierdzone parametry procesu dla pary produkt–maszyna. Każda produkcja zachowuje wersję karty, a uwagi z hali trafiają do historii.":
    "Stores the approved process parameters for each product–machine pair. Every production run keeps the card version, and shop-floor notes go into the history.",
  "Karta logistyczna": "Logistics card",
  Logistyka: "Logistics",
  "Definiuje pakowanie, paletyzację i operacje dodatkowe. Automatycznie liczy masę i wysokość palety oraz przekazuje zapotrzebowanie na opakowania.":
    "Defines packing, palletising and additional operations. It computes pallet mass and height automatically and passes the packaging requirement onwards.",
  "Magazyn i rezerwacje": "Warehouse and reservations",
  Magazyn: "Warehouse",
  "Kontroluje stany, rezerwacje i ceny rzeczywiste materiałów. Faktura zakupowa wraca do kalkulacji, a zatwierdzone zlecenie pozwala wystawić WZ.":
    "Controls stock, reservations and actual material prices. A purchase invoice flows back into costing, and an approved order allows a dispatch note to be issued.",
  "Analityka zarządcza": "Management analytics",
  Analityka: "Analytics",
  "Łączy dane ze wszystkich modułów i pokazuje wynik według produktu, klienta i maszyny. Każdy alert prowadzi do dokumentów, z których powstał.":
    "Combines data from every module and shows the result by product, customer and machine. Every alert leads back to the documents it came from.",

  /* ── Zakładki ──────────────────────────────────────────────────────── */
  Kalkulacja: "Costing",
  Klienci: "Customers",
  Zamówienia: "Customer orders",
  "Szarże produkcyjne": "Production batches",
  Zatwierdzanie: "Approval",
  "Panel operatora": "Operator panel",
  Nastawiacz: "Setter",
  Korekta: "Correction",
  "Koszt rzeczywisty": "Actual cost",
  "Historia produkcji": "Production history",
  "Plan tygodniowy": "Weekly plan",
  Rezerwacje: "Reservations",
  "Wydruk TPP": "Weekly plan printout",
  "Rejestr form": "Mould register",
  Awarie: "Failures",
  Narzędziownia: "Toolroom",
  "Karty technologiczne": "Process cards",
  "Historia wersji": "Version history",
  "Uwagi z hali": "Shop-floor notes",
  "Karty logistyczne": "Logistics cards",
  Paletyzacja: "Palletising",
  "Operacje dodatkowe": "Additional operations",
  Stany: "Stock",
  "PZ / WZ": "GRN / GDN",
  "Faktury zakupu": "Purchase invoices",
  "Raport właścicielski": "Owner report",
  Pulpit: "Dashboard",
  "Rentowność portfela": "Portfolio profitability",
  Odchylenia: "Variances",

  /* ── Dokumenty ─────────────────────────────────────────────────────── */
  "Karta klienta": "Customer card",
  "Karta produktu": "Product card",
  "Arkusz kalkulacyjny": "Costing sheet",
  "Zamówienie klienta": "Customer order",
  "Zlecenie produkcyjne": "Production order",
  "Protokół zatwierdzenia": "Approval protocol",
  "Protokół zatwierdzenia zlecenia": "Order approval protocol",
  "Raport zmianowy": "Shift report",
  "Raport zmianowy operatora": "Operator shift report",
  "Raport nastawiacza": "Setter report",
  "Protokół korekty": "Correction protocol",
  "Rozliczenie kosztu": "Cost settlement",
  "Rozliczenie kosztu rzeczywistego": "Actual cost settlement",
  "Wpis planu": "Plan entry",
  "Tygodniowy plan produkcji": "Weekly production plan",
  "Zgłoszenie awarii": "Failure report",
  "Zgłoszenie awarii formy": "Mould failure report",
  "Protokół serwisu": "Service protocol",
  "Protokół serwisu formy": "Mould service protocol",
  "Specyfikacja paletowa": "Pallet specification",
  "Zapotrzebowanie materiałowe": "Material requirement",
  "Przyjęcie zewnętrzne": "Goods receipt note",
  "Wydanie zewnętrzne": "Goods dispatch note",
  "Faktura zakupu": "Purchase invoice",
  "Alert rentowności": "Profitability alert",

  /* ── Statusy i metryka dokumentu ───────────────────────────────────── */
  roboczy: "draft",
  zlozony: "submitted",
  zatwierdzony: "approved",
  skorygowany: "corrected",
  Autor: "Author",
  Rola: "Role",
  Data: "Date",
  Powiązanie: "Related to",
  "Trasa dokumentu": "Document route",
  "Eksport do Excel": "Export to Excel",
  "Tworzenie…": "Building…",
  "Wartość z": "Value from",

  /* ── Zarządzanie dostępem ──────────────────────────────────────────── */
  "ZARZĄDZANIE DOSTĘPEM": "ACCESS MANAGEMENT",
  "Każda osoba ma imienne konto, rolę oraz oddzielne prawa do wglądu i edycji. Wybierz użytkownika, aby zobaczyć aplikację dokładnie tak, jak widzi ją ta osoba.":
    "Every person has a named account, a role and separate view and edit rights. Pick a user to see the application exactly as that person sees it.",
  "TRYB DEMO:": "DEMO MODE:",
  "symulacja uprawnień bez produkcyjnego logowania":
    "permission simulation without production authentication",
  "Użytkownik i rola": "User and role",
  "Edytowane dokumenty": "Editable documents",
  BRAK: "NONE",
  WGLĄD: "VIEW",
  EDYCJA: "EDIT",
  ADMIN: "ADMIN",
  "Moduł jest zablokowany i nie ujawnia danych.": "The module is locked and reveals no data.",
  "Dokumenty są widoczne, ale wszystkie akcje edycji są zablokowane.":
    "Documents are visible but every editing action is blocked.",
  "Użytkownik może zmieniać tylko dokumenty przypisane do jego roli.":
    "The user can only change documents assigned to their role.",
  "BRAK DOSTĘPU DO MODUŁU": "NO ACCESS TO MODULE",
  "nie ma prawa oglądać danych modułu": "is not allowed to view the data of module",
  "Próba dostępu byłaby zapisana w audycie.":
    "The access attempt would be recorded in the audit log.",
  "Zobacz macierz uprawnień": "See the permission matrix",
  "TRYB TYLKO DO ODCZYTU": "READ-ONLY MODE",
  "nie może edytować dokumentów w tym module": "cannot edit documents in this module",
  "brak zdjęcia profilowego": "no profile photo",

  /* ── Stanowiska i role ─────────────────────────────────────────────── */
  CEO: "CEO",
  "Administrator systemu": "System administrator",
  "Operatorka wtryskarki": "Injection moulding operator",
  "Operator wtryskarki": "Injection moulding operator",
  "Operator produkcji": "Production operator",
  "Nastawiacz maszyn": "Machine setter",
  "Kierownik produkcji": "Production manager",
  Narzędziowiec: "Toolmaker",
  Handlowiec: "Sales representative",
  Sprzedaż: "Sales",
  Technolog: "Process engineer",
  "Kontrola jakości": "Quality control",
  "Specjalista ds. logistyki": "Logistics specialist",
  Magazynier: "Storekeeper",
  Księgowa: "Accountant",
  Księgowość: "Accounting",
  właściciel: "owner",
  operator: "operator",
  technolog: "process engineer",
  narzędziownia: "toolroom",
  planista: "planner",
  sprzedaż: "sales",
  "kontrola jakości": "quality control",
  księgowość: "accounting",
  logistyka: "logistics",
  magazyn: "warehouse",
  system: "system",
  Właściciel: "Owner",
  "Właściciel / controlling": "Owner / controlling",

  /* ── Raport właścicielski ──────────────────────────────────────────── */
  "Wpływ odchyleń na wynik": "Variance impact on profit",
  "tyle produkcja kosztowała ponad plan": "how much production cost above plan",
  "tyle zaoszczędzono względem planu": "how much was saved against plan",
  "Szarże powyżej planu": "Batches above plan",
  "liczba szarż droższych niż zakładano": "number of batches more expensive than assumed",
  "Największe odchylenie": "Largest variance",
  "Średnie odchylenie TKW": "Average manufacturing cost variance",
  "średnia po wszystkich szarżach": "average across all batches",
  "Techniczny koszt wytworzenia — plan wobec realizacji":
    "Technical manufacturing cost — plan versus actual",
  "Kliknij wiersz, żeby zobaczyć rozbicie obu kwot na sześć składników wraz z dokumentami źródłowymi. Kliknij status, żeby poznać regułę, która go nadała.":
    "Click a row to break both figures down into six components together with their source documents. Click a status to see the rule that assigned it.",
  "Sortuj: wg odchylenia": "Sort: by variance",
  "Sortuj: wg daty": "Sort: by date",
  Produkt: "Product",
  Rozpoczęcie: "Started",
  Zakończenie: "Finished",
  "TKW plan": "Cost plan",
  "TKW zrealizowany": "Cost actual",
  Odchylenie: "Variance",
  Status: "Status",
  szarża: "batch",
  "Raport obejmuje szarże z kompletem parametrów kosztowych. Kolumna „TKW zrealizowany” jest liczona z danych produkcyjnych szarży — brakowości, czasu cyklu, przestojów, przezbrojeń i zużycia formy.":
    "The report covers batches with a complete set of cost parameters. The “Cost actual” column is computed from the batch production data — scrap rate, cycle time, downtime, changeovers and mould wear.",
  "W NORMIE": "ON TARGET",
  "DO SPRAWDZENIA": "TO REVIEW",
  "WYMAGA DECYZJI": "NEEDS A DECISION",
  "Zobacz regułę, która nadała ten status": "See the rule that assigned this status",

  /* ── Rozbicie TKW ──────────────────────────────────────────────────── */
  "skąd się biorą te liczby": "where these numbers come from",
  Zwiń: "Collapse",
  Zamknij: "Close",
  "TKW plan — suma sześciu składników": "Cost plan — sum of six components",
  "TKW zrealizowany — suma sześciu składników": "Cost actual — sum of six components",
  "Odchylenie — suma nośników poniżej": "Variance — sum of the drivers below",
  "1 · Z czego składa się TKW": "1 · What the manufacturing cost is made of",
  "Sześć składników technicznego kosztu wytworzenia, każdy z pełnym działaniem i dokumentem, z którego pochodzą jego dane. Kolumny sumują się do liczb z wiersza tabeli.":
    "Six components of the technical manufacturing cost, each with the full arithmetic and the document its data comes from. The columns add up to the figures in the table row.",
  "Składnik i jego dane źródłowe": "Component and its source data",
  "Plan — wyliczenie": "Plan — calculation",
  "Realizacja — wyliczenie": "Actual — calculation",
  "Razem — techniczny koszt wytworzenia": "Total — technical manufacturing cost",
  "2 · Dane wejściowe i dokumenty, z których pochodzą":
    "2 · Input data and the documents it comes from",
  "Plan pochodzi z kalkulacji i kart wyrobu, realizacja wyłącznie z dokumentów wystawionych na hali. Żadna liczba w tym raporcie nie jest wpisywana ręcznie w module 9.":
    "The plan comes from the costing and the product cards; the actuals come only from documents issued on the shop floor. No number in this report is typed in by hand in module 9.",
  Parametr: "Parameter",
  Realizacja: "Actual",
  "Dokument planu": "Plan document",
  "Dokument realizacji": "Actual document",
  "3 · Mostek: dlaczego realizacja różni się od planu":
    "3 · Bridge: why the actual differs from the plan",
  "Każdy nośnik jest liczony przez podstawienie jednej zmiany do modelu kosztowego, po kolei. Dzięki temu nośniki sumują się do odchylenia co do grosza — bez pozycji „pozostałe”.":
    "Each driver is computed by substituting one change into the cost model at a time. That is why the drivers add up to the variance to the last grosz — with no “other” line.",
  "Razem nośniki": "Drivers total",
  "źródło:": "source:",
  "plan:": "plan:",
  "realizacja:": "actual:",
  "wpływa na:": "affects:",
  "Kontrola sumy: sześć składników realizacji daje": "Sum check: the six actual components give",
  "czyli dokładnie TKW zrealizowany z tabeli. Koszt techniczny wg kalkulacji z modułu 1 (bez przygotowania produkcji, amortyzacji formy i opakowania) wynosi":
    "which is exactly the actual manufacturing cost from the table. The technical cost per the module 1 costing (without production setup, mould depreciation and packaging) is",
  "Wartości pośrednie w wyliczeniach są zaokrąglone do prezentacji — kolumny liczone są na wartościach dokładnych.":
    "Intermediate values in the arithmetic are rounded for display — the columns are computed on exact values.",
  "sztuk dobrych": "good pieces",
  "wpływu tej szarży na wynik firmy.": "of impact of this batch on the company result.",

  /* ── Wyjaśnienie statusu ───────────────────────────────────────────── */
  "Status szarży:": "Batch status:",
  "szarża zakończona": "batch finished",
  "Dlaczego ta szarża dostała taki status": "Why this batch received this status",
  "marża jednostkowa poniżej zera LUB odchylenie TKW powyżej 25%":
    "unit margin below zero OR manufacturing cost variance above 25%",
  "Szarża wymaga decyzji właściciela: ceny, technologii albo warunków z klientem.":
    "The batch needs an owner decision: on price, on process or on terms with the customer.",
  "odchylenie TKW od 5% do 25% przy dodatniej marży":
    "manufacturing cost variance between 5% and 25% with a positive margin",
  "Produkcja się broni, ale odchylenie jest na tyle duże, że trzeba je wyjaśnić.":
    "The run still pays, but the variance is large enough to require an explanation.",
  "odchylenie TKW poniżej 5% i dodatnia marża":
    "manufacturing cost variance below 5% and a positive margin",
  "Realizacja mieści się w założeniach — brak działań.":
    "The actual result is within assumptions — no action required.",
  "Liczby, które uruchomiły regułę": "The numbers that triggered the rule",
  "Cena sprzedaży wg kartoteki": "Selling price from master data",
  "Marża jednostkowa w planie": "Unit margin in plan",
  "Marża jednostkowa po realizacji": "Unit margin after execution",
  "Odchylenie TKW": "Manufacturing cost variance",
  "Wynik na szarży": "Result on the batch",
  "Warunek spełniony:": "Condition met:",
  "marża jednostkowa jest ujemna i odchylenie TKW przekracza 25%":
    "the unit margin is negative and the manufacturing cost variance exceeds 25%",
  "marża jednostkowa jest ujemna — cena sprzedaży nie pokrywa kosztu wytworzenia":
    "the unit margin is negative — the selling price does not cover the manufacturing cost",
  "odchylenie TKW przekracza 25%": "the manufacturing cost variance exceeds 25%",
  "Największy pojedynczy powód:": "The single largest reason:",
  "odchylenie TKW mieści się w przedziale 5–25%":
    "the manufacturing cost variance is between 5% and 25%",
  ", a marża pozostaje dodatnia.": ", while the margin stays positive.",
  "Do wyjaśnienia przede wszystkim:": "To be explained first of all:",
  "Żaden warunek ostrzegawczy nie został spełniony —": "No warning condition was met —",
  "odchylenie poniżej 5%": "variance below 5%",
  "przy dodatniej marży. Szarża potwierdza, że kalkulacja tego wyrobu jest realna.":
    "with a positive margin. The batch confirms that the costing of this product is realistic.",
  "Decyzje do podjęcia": "Decisions to take",
  "Co można z tym zrobić": "What can be done with this",
  "Sprawdź raport zmianowy": "Check shift report",
  "Dane realizacji tej szarży pochodzą z raportu operatora":
    "The actuals for this batch come from the report of operator",
  "Tam widać ilości, cykl i przestoje.": "It shows quantities, cycle time and downtime.",
  "Przejrzyj kartę formy": "Review mould card",
  "Serwis formy obciążył tę szarżę kwotą": "Mould service charged this batch",
  "Sprawdź historię awarii i licznik cykli.":
    "Check the failure history and the cycle counter.",
  "wszedł w koszt maszyny i robocizny. Sprawdź, czy przyczyna leży po stronie formy.":
    "went into machine and labour cost. Check whether the cause lies with the mould.",
  "Zrewiduj kalkulację": "Revise the costing for",
  "cena minimalna": "minimum price",
  "Przy dotychczasowym narzucie": "At the current markup of",
  "i koszcie": "and a cost of",
  "to jest cena, która odtwarza założoną marżę. Obecna cena:":
    "this is the price that restores the assumed margin. Current price:",
  "Zobacz pełne rozliczenie kosztu rzeczywistego": "See the full actual cost settlement",
  "Moduł 3 pokazuje rozliczenie zlecenia dokument po dokumencie — to samo źródło, z którego liczona jest kolumna „TKW zrealizowany”.":
    "Module 3 shows the order settlement document by document — the same source the “Cost actual” column is computed from.",
  Przestój: "Downtime",

  /* ── Szarże produkcyjne ────────────────────────────────────────────── */
  "Szarże w ostatnich 60 dniach": "Batches in the last 60 days",
  "Zakończone / aktywne": "Finished / active",
  "Wyprodukowano dobrych": "Good pieces produced",
  "Brakowość łączna": "Total scrap rate",
  "Szarża, zlecenie, partia lub operator…": "Batch, order, lot or operator…",
  "Wszystkie wyroby": "All products",
  "Wszystkie statusy": "All statuses",
  Zakończone: "Finished",
  "W realizacji": "In progress",
  Wstrzymane: "On hold",
  ZAKOŃCZONA: "FINISHED",
  "W REALIZACJI": "IN PROGRESS",
  WSTRZYMANA: "ON HOLD",
  "Szarża / data": "Batch / date",
  Wyrób: "Product",
  Maszyna: "Machine",
  Dobre: "Good",
  Braki: "Scrap",
  "Karta szarży produkcyjnej": "Production batch card",
  "Status szarży": "Batch status",
  Zlecenie: "Order",
  "Maszyna / forma": "Machine / mould",
  Start: "Start",
  Koniec: "End",
  "Operator / nastawiacz": "Operator / setter",
  Zmiana: "Shift",
  "Partia surowca": "Material lot",
  "Partia barwnika": "Colorant lot",
  "Plan / dobre": "Plan / good",
  "Wadliwe / brakowość": "Rejected / scrap rate",
  "Cykl rzeczywisty": "Actual cycle time",
  "Raport źródłowy": "Source report",
  "Pełna identyfikowalność: wyrób → zlecenie → szarża → partie materiałów → maszyna i forma → operator → raport zmianowy.":
    "Full traceability: product → order → batch → material lots → machine and mould → operator → shift report.",
  ZWOLNIONA: "RELEASED",
  WARUNKOWO: "CONDITIONAL",
  OCZEKUJE: "PENDING",

  /* ── Archiwum ──────────────────────────────────────────────────────── */
  moduł: "module",
  "Dokumenty z ostatnich sześciu miesięcy. Rekordy zatwierdzone pozostają niezmienne; korekty są oznaczone osobnym statusem.":
    "Documents from the last six months. Approved records stay immutable; corrections are flagged with a separate status.",
  "W module:": "In this module:",
  "w całym systemie:": "in the whole system:",
  "Numer, autor, zlecenie lub treść…": "Number, author, order or content…",
  "Wszystkie typy": "All types",
  Zatwierdzone: "Approved",
  Skorygowane: "Corrected",
  "Brak dokumentów dla wybranych filtrów.": "No documents match the selected filters.",
  Przedmiot: "Subject",
  "Opis archiwalny": "Archive description",
  "Powiązane zlecenie": "Related order",
  "Dokument kartotekowy": "Master-data document",
  "Dokument źródłowy": "Source document",
  "Wartość / kwota": "Value / amount",
  "Nie dotyczy": "Not applicable",
  Integralność: "Integrity",
  "Dokument zamknięty · zachowana historia autora i statusu":
    "Document closed · author and status history preserved",
  "Dokument można przeglądać i śledzić do źródła. Ewentualna zmiana wymaga protokołu korekty — oryginalny zapis pozostaje w archiwum.":
    "The document can be reviewed and traced to its source. Any change requires a correction protocol — the original record stays in the archive.",

  /* ── Mapa systemu i obieg ──────────────────────────────────────────── */
  "MAPA SYSTEMU · obieg dokumentów P12": "SYSTEM MAP · P12 document flow",
  "Moduł 0 — rozpoznanie w zakładzie — jest punktem wyjścia przed wdrożeniem, a nie zakładką operacyjną.":
    "Module 0 — surveying the plant — is the starting point before implementation, not an operational tab.",
  "Pokaż tylko przepływ dokumentów wybranego modułu":
    "Show only the document flow of the selected module",
  "PĘTLA KOSZTOWA · RKR: 3 → 1": "COST LOOP · RKR: 3 → 1",
  "WARSTWA 1 — DANE PODSTAWOWE": "LAYER 1 — MASTER DATA",
  "WARSTWA 2 — PLANOWANIE": "LAYER 2 — PLANNING",
  "WARSTWA 3 — WYKONANIE": "LAYER 3 — EXECUTION",
  "WARSTWA 4 — WNIOSKI": "LAYER 4 — INSIGHTS",
  "„Każda strzałka to dokument, który przechodzi z jednego działu do drugiego. Dziś te dokumenty przechodzą na papierze i w arkuszach — i część z nich nie dociera.”":
    "“Every arrow is a document moving from one department to another. Today those documents travel on paper and in spreadsheets — and some of them never arrive.”",
  "DOKUMENT PRZEKAZANY": "DOCUMENT HANDED OVER",
  PRZYJĘTO: "RECEIVED",
  DOKUMENT: "DOCUMENT",
  DOKUMENTY: "DOCUMENTS",
  "Dokument dotarł i zaktualizował powiązane dane.":
    "The document arrived and updated the related data.",
  zobacz: "open",

  /* ── Trasy dokumentów ──────────────────────────────────────────────── */
  "Tworzy zlecenie produkcyjne.": "Creates a production order.",
  "Generuje zapotrzebowanie materiałowe.": "Generates a material requirement.",
  "Tworzy wpis w planie produkcyjnym.": "Creates a production plan entry.",
  "Rezerwuje właściwą formę.": "Reserves the right mould.",
  "Wskazuje obowiązującą wersję karty technologicznej.":
    "Points to the effective process card version.",
  "Pobiera kartę logistyczną produktu.": "Pulls the product logistics card.",
  "Rezerwuje materiały i opakowania.": "Reserves materials and packaging.",
  "Aktualizuje koszt rzeczywisty zlecenia.": "Updates the actual order cost.",
  "Koryguje przewidywany termin zakończenia.": "Corrects the expected completion date.",
  "Aktualizuje licznik cykli formy.": "Updates the mould cycle counter.",
  "Przekazuje uwagi procesowe technologowi i następnej zmianie.":
    "Passes process notes to the engineer and the next shift.",
  "Zdejmuje zużyty materiał ze stanu.": "Removes the consumed material from stock.",
  "Oznacza plan jako zagrożony.": "Flags the plan as at risk.",
  "Koryguje ilości i ponownie przelicza koszt.": "Corrects quantities and recalculates the cost.",
  "Aktualizuje analitykę z zachowaniem śladu korekty.":
    "Updates the analytics while keeping the correction trail.",
  "Oznacza kalkulację jako nieaktualną i podaje sugerowaną cenę.":
    "Marks the costing out of date and gives a suggested price.",
  "Zasila analitykę kosztu i rentowności.": "Feeds the cost and profitability analytics.",
  "Aktualizuje cenę materiału i przelicza marże.":
    "Updates the material price and recalculates margins.",
  "Aktualizuje analitykę wpływu cen zakupowych.":
    "Updates the analytics of purchase-price impact.",
  "Zmienia status formy na serwis.": "Changes the mould status to service.",
  "Zwalnia blokadę formy w planie.": "Releases the mould block in the plan.",
  "Przywraca status sprawnej formy.": "Restores the mould to working status.",

  /* ── Dane przykładowe: produkty i materiały ────────────────────────── */
  "Miska dla psa 900 ml": "Dog bowl 900 ml",
  "Szarpak Rope": "Rope tug toy",
  "Gryzak kość mały": "Small bone chew",
  "P-103 Gryzak kość mały": "P-103 Small bone chew",
  "Klips do smyczy": "Leash clip",
  "Rączka RAIS 2 – elastomer": "RAIS 2 handle – elastomer",
  "Rączka RAIS 2": "RAIS 2 handle",
  "Pokrywa kuwety maxi": "Maxi litter tray lid",
  "PetLine Polska": "PetLine Polska",
  "Animal House": "Animal House",
  "ZooMarket Dystrybucja": "ZooMarket Dystrybucja",

  /* ── Uzupełnienia interfejsu ekranów ───────────────────────────────── */
  "Krotność formy": "Mould cavities",
  Krotność: "Cavities",
  "Brakowość zakładana": "Assumed scrap rate",
  Brakowość: "Scrap rate",
  materiał: "material",
  Materiał: "Material",
  "Razem koszt bezpośredni": "Total direct cost",
  "Cena sprzedaży": "Selling price",
  "Marża jednostkowa": "Unit margin",
  Wydajność: "Output",
  "Marża/h": "Margin/h",
  "Czas cyklu": "Cycle time",
  "Koszt jednostkowy": "Unit cost",
  Narzut: "Markup",
  Cena: "Price",
  Indeks: "Code",
  Nazwa: "Name",
  "Materiał główny": "Main material",
  "Praca ciągła": "Continuous run",
  Przezbrojenie: "Changeover",
  "Brakowość narastająco": "Cumulative scrap rate",
  "Pozostało do zrobienia": "Remaining to produce",
  "Szac. czas do zakończenia": "Est. time to completion",
  ŻÓŁTY: "AMBER",
  CZERWONY: "RED",
  ZIELONY: "GREEN",
  "Sprzedajesz poniżej kosztu wytworzenia": "You are selling below manufacturing cost",
  "Różnica:": "Difference:",
  "Marża spadła poniżej założonej": "The margin fell below the assumed level",
  "Karta produktu — P-105 Rączka RAIS 2": "Product card — P-105 RAIS 2 handle",
  "Waga netto / brutto": "Net / gross weight",
  Forma: "Mould",
  "Krotność / cykl": "Cavities / cycle",
  "Zamówienie źródłowe": "Source order",
  ZAKOŃCZONE: "COMPLETED",
  "Rozliczenie ilościowe": "Quantity settlement",
  "Po zatwierdzeniu magazyn może wystawić WZ":
    "Once approved, the warehouse can issue a dispatch note",
  "Zatwierdź i przekaż do WZ": "Approve and pass to dispatch",
  "Centrum dystrybucyjne Zachód": "West distribution centre",
  "Centrum dystrybucyjne Zachód — wymaga potwierdzenia":
    "West distribution centre — requires confirmation",
  "P-105 Rączka RAIS 2": "P-105 RAIS 2 handle",
  Ilość: "Quantity",
  "5 000 szt. · 5 kolorów po 1 000": "5,000 pcs · 5 colours of 1,000",
  "Powstałe dokumenty": "Documents created",
  "Zatwierdź RKR i zamknij pętlę kosztową": "Approve RKR and close the cost loop",
  "RKR przekazane": "RKR handed over",
  "Brak prawa do dokumentu RKR": "No rights to document RKR",
  Powód: "Reason",
  Ślad: "Trail",
  "Zatwierdź korektę i przelicz koszt": "Approve the correction and recalculate the cost",
  "Złóż raport i przekaż do 5 modułów": "Submit the report and pass it to 5 modules",
  "Brak prawa do dokumentu RZ": "No rights to document RZ",
  "Otwórz pełny panel operatorski": "Open the full operator panel",
  "Formularz RZ jest zablokowany dla tej roli.": "The RZ form is locked for this role.",
  "Operator / zmiana": "Operator / shift",
  "Dobre / wadliwe": "Good / rejected",
  "Rzeczywisty cykl": "Actual cycle time",
  "Przezbrojenie narastająco": "Cumulative changeover",
  Uwagi: "Notes",
  "Zajęte maszyny": "Machines occupied",
  Zagrożenia: "At risk",
  ŚR: "WED",
  "F-001 w serwisie — plan oznaczony jako zagrożony.":
    "F-001 in service — the plan is flagged as at risk.",
  "Zakończ serwis i zwolnij plan": "Finish the service and release the plan",
  "FORMA WYCOFANA — BLOKADA UŻYCIA.": "MOULD WITHDRAWN — USE BLOCKED.",
  "Pozostaje w systemie wyłącznie jako paszport historyczny i źródło danych dawnych produkcji.":
    "It stays in the system solely as a historical passport and a source of past production data.",
  "Historia zdarzeń formy": "Mould event history",
  "Planowany odbiór": "Planned acceptance",
  "Obowiązuje od": "Effective from",
  "Kartony na warstwę": "Cartons per layer",
  "Wysokość palety": "Pallet height",
  "Paleta zgodna z limitem przewoźnika.": "Pallet within the carrier height limit.",
  Dostępne: "Available",
  "Faktura zakupu — wejście cen": "Purchase invoice — price entry",
  "Zatwierdź cenę i przekaż do modułów 1 i 9": "Approve the price and pass it to modules 1 and 9",
  "Przeliczenie marż wszystkich produktów zawierających M1":
    "Recalculation of margins for every product containing M1",
  "Przyjęcie TPE-S 4055": "Receipt of TPE-S 4055",
  "Cena poniżej kosztu": "Price below cost",
  Działanie: "Action",
  "RKR → MODUŁ 1": "RKR → MODULE 1",
  "Historia zrealizowanych procesów produkcyjnych": "History of completed production runs",
  "Zatwierdzone i skorygowane produkcje z zachowaniem maszyny, formy i wersji technologii użytej w danym dniu.":
    "Approved and corrected runs, keeping the machine, mould and process card version used on the day.",
  "Po zatwierdzeniu koszt wróci do kalkulacji P-105 i analityki.":
    "Once approved, the cost flows back to the P-105 costing and to analytics.",
  "Wynik według perspektywy": "Result by perspective",
  "Zamówienie klienta ": "Customer order ",
  /* ── Uzupełnienia z ekranów modułów ────────────────────────────────── */
  "szt.": "pcs",
  "zm.": "sh.",
  "Licznik końcowy cykli": "Final cycle counter",
  "Pole odkładcze": "Storage footprint",
  "Powód wycofania": "Withdrawal reason",
  "Licznik cykli": "Cycle counter",
  Lokalizacja: "Location",
  "Waga formy": "Mould weight",
  "Metoda przezbrojenia": "Changeover method",
  "Czas przezbrojenia": "Changeover time",
  "Historia awarii": "Failure history",
  "Okres eksploatacji": "Service period",
  Wymiary: "Dimensions",
  Produkty: "Products",
  Uwaga: "Note",
  Wynik: "Result",
  Klient: "Customer",
  Termin: "Due date",
  Kolor: "Colour",
  Operator: "Operator",
  Maszyny: "Machines",
  Opakowanie: "Packaging",
  "Sztuk w kartonie": "Pieces per carton",
  "Warstw na palecie": "Layers per pallet",
  "Sztuk na palecie": "Pieces per pallet",
  "Limit wysokości": "Height limit",
  "Masa produktu": "Product mass",
  Temperatura: "Temperature",
  Docisk: "Holding pressure",
  Chłodzenie: "Cooling",
  Wersja: "Version",
  /* ── Ekrany: rentowność, rozliczenie, raport zmianowy ──────────────── */
  "Marża na maszynogodzinę": "Margin per machine hour",
  "Ranking wg marży na maszynogodzinę": "Ranking by margin per machine hour",
  "Rozkład odchylenia: kalkulacja → rzeczywistość": "Variance breakdown: costing → actual",
  "Odśwież kalkulację na podstawie danych rzeczywistych": "Refresh the costing from actual data",
  "Przelicz cenę tak, aby odtworzyć założony narzut na bazie kosztu rzeczywistego.":
    "Recalculate the price so that the assumed markup is restored on the actual cost.",
  "Zakończone zlecenia": "Completed orders",
  "Zastosuj do wszystkich produktów": "Apply to all products",
  "Zatwierdź raport zmiany": "Approve the shift report",
  Wyczyść: "Clear",
  "1,6119 zł": "1.6119 zł",
  "RKR/2026/0218 wykazało koszt 1,1783 zł przy cenie 1,1500 zł. Sugerowana cena przy narzucie 36,8%:":
    "RKR/2026/0218 showed a cost of 1.1783 zł against a price of 1.1500 zł. Suggested price at a 36.8% markup:",
};



/** Tłumaczy tekst źródłowy; brak wpisu zwraca oryginał, więc nic nie znika. */
export function translate(lang: Lang, text: string): string {
  if (lang === "pl") return text;
  return dictionary[text] ?? text;
}

/** Wariant językowy dla zdań, których nie da się złożyć ze słownika. */
export function pick(lang: Lang, pl: string, en: string): string {
  return lang === "pl" ? pl : en;
}

/** Separator dziesiętny idzie za językiem; walutą pozostaje złoty. */
export function localeOf(lang: Lang): string {
  return lang === "pl" ? "pl-PL" : "en-GB";
}
