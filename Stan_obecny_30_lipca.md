# P12 — stan obecny aplikacji na 24 lipca 2026

## 1. Informacje podstawowe

**Nazwa projektu:** P12 — system sterowania i controllingu produkcji  
**Charakter aplikacji:** rozbudowany demonstrator sprzedażowy systemu zarządzania produkcją  
**Branża:** wtryskownia tworzyw sztucznych  
**Język interfejsu:** polski  
**Stan opisany na dzień:** 24 lipca 2026  
**Publiczny adres demonstratora:** `https://production-calculation.sigmaquality.pl/`

Aplikacja P12 przedstawia spójny obieg informacji w przedsiębiorstwie produkcyjnym: od kartoteki klienta i produktu, przez przyjęcie zamówienia, planowanie, przygotowanie formy i technologii, realizację produkcji, raportowanie zmianowe, logistykę i magazyn, aż do rozliczenia kosztu rzeczywistego oraz analityki zarządczej.

Najważniejszą ideą aplikacji jest zamknięcie pętli kosztowej:

```text
kalkulacja teoretyczna
    → zlecenie
    → produkcja
    → raport zmianowy
    → koszt rzeczywisty
    → ponowna ocena kalkulacji i ceny
```

W tradycyjnym procesie opartym na arkuszach kalkulacyjnych dane z zakończonej produkcji często nie wracają do pierwotnej kalkulacji. P12 pokazuje, jak system może automatycznie wykryć, że koszt rzeczywisty przekroczył koszt planowany i że dotychczasowa cena sprzedaży wymaga aktualizacji.

## 2. Status rozwiązania

P12 jest demonstratorem, a nie produkcyjnym systemem MES/ERP.

Demonstrator:

- działa w przeglądarce;
- przedstawia dziewięć modułów biznesowych;
- zawiera interaktywne formularze i dokumenty;
- pokazuje obieg dokumentów pomiędzy działami;
- ma rozbudowane dane przykładowe;
- pozwala wcielać się w użytkowników o różnych rolach;
- symuluje uprawnienia do wglądu i edycji;
- eksportuje dokumenty do prawdziwych plików Excel;
- wykonuje rzeczywiste obliczenia kosztowe;
- działa bez backendu i bazy danych;
- po resecie wraca do kontrolowanego stanu demonstracyjnego.

Demonstrator nie zawiera produkcyjnego uwierzytelniania, trwałości danych ani rzeczywistych integracji z maszynami i systemem magazynowym.

## 3. Technologie

Aplikacja wykorzystuje:

- Next.js 15;
- React 19;
- TypeScript w trybie `strict`;
- Zustand do zarządzania stanem demonstratora;
- Tailwind CSS 4;
- Recharts do wizualizacji danych;
- Lucide React do ikon;
- SheetJS `xlsx` do generowania plików Excel;
- statyczny eksport Next.js.

Konfiguracja Next.js wykorzystuje:

```text
output: "export"
```

Wynikiem polecenia `npm run build` jest katalog `out/` zawierający statyczne pliki HTML, CSS i JavaScript.

## 4. Uruchomienie i wdrożenie

### 4.1. Uruchomienie lokalne

```bash
npm install
npm run dev
```

Aplikacja uruchamia się pod adresem:

```text
http://localhost:8507
```

### 4.2. Kontrola obliczeń

```bash
npm run verify
```

Skrypt sprawdza:

- koszt jednostkowy wszystkich produktów;
- narzut procentowy;
- wydajność godzinową;
- marżę na maszynogodzinę;
- koszty rzeczywiste zakończonych zleceń;
- procentowe odchylenia;
- wynik na sztuce;
- sumę wykresu waterfall;
- sugerowaną cenę P-105.

### 4.3. Build produkcyjny

```bash
npm run build
```

### 4.4. Publiczne wdrożenie

Publiczna domena jest obsługiwana przez nginx. Nginx przekazuje ruch do portu `8507`.

Na porcie `8507` działa usługa systemd:

```text
p12-production-process-control.service
```

Usługa uruchamia statyczny serwer:

```text
serve out -l 8507 -s
```

Aktualne wdrożenie nie wykorzystuje Dockera.

## 5. Główna nawigacja

Lewy pasek zawiera:

```text
0. Mapa systemu

DANE PODSTAWOWE
1. Kartoteka i kalkulacja
5. Karta formy
6. Karta technologiczna
7. Karta logistyczna

PLANOWANIE
2. Zlecenia produkcyjne
4. Plan produkcyjny
8. Magazyn i rezerwacje

WYKONANIE
3. Raport zmianowy i koszt rzeczywisty

WNIOSKI
9. Analityka zarządcza

A. Zarządzanie dostępem
```

Skróty:

- `0`–`9` — otwarcie odpowiedniego modułu;
- `M` — Mapa systemu;
- `A` — Zarządzanie dostępem.

## 6. Wspólny nagłówek modułu

Każdy moduł posiada jednolity nagłówek:

- numer i nazwę modułu;
- opis celu;
- listę dokumentów modułu;
- odznaki modułów źródłowych;
- odznaki modułów docelowych;
- przycisk „Gdzie jestem w systemie”;
- zakładki funkcjonalne;
- zakładkę „Archiwum dokumentów”.

Kliknięcie modułu źródłowego lub docelowego przenosi bezpośrednio do wskazanego obszaru.

## 7. Mapa systemu

Mapa jest interaktywnym diagramem SVG.

Pokazuje cztery warstwy:

1. dane podstawowe;
2. planowanie;
3. wykonanie;
4. wnioski.

Każdy moduł jest przedstawiony jako osobny blok. Linie pomiędzy modułami oznaczają przechodzące dokumenty.

Mapa pokazuje m.in. symbole:

- `KP`;
- `ZK`;
- `ZP`;
- `RZ`;
- `RN`;
- `RKR`;
- `FZ`;
- `ZAF`;
- `PSF`;
- `KL`;
- `KT`;
- `AK`.

Najważniejszym elementem jest gruba czerwona linia:

```text
PĘTLA KOSZTOWA · RKR: 3 → 1
```

Po wejściu na mapę z danego modułu:

- bieżący moduł jest czerwony;
- moduły bezpośrednio powiązane są niebieskie;
- pozostałe są wyszarzone.

Mapa ma filtr pokazujący wyłącznie przepływy wybranego modułu.

## 8. Wspólny komponent dokumentu

Dokumenty są renderowane przez wspólny komponent `DocumentSheet`.

Każdy dokument zawiera:

- symbol i numer;
- nazwę;
- status;
- autora;
- rolę autora;
- datę;
- zmianę;
- powiązane zlecenie;
- pola dokumentu;
- źródła pochodzenia wartości;
- trasę dokumentu;
- przycisk eksportu do Excela.

Statusy dokumentów:

- `ROBOCZY`;
- `ZŁOŻONY`;
- `ZATWIERDZONY`;
- `SKORYGOWANY`.

## 9. Katalog dokumentów

W systemie występują:

| Symbol | Dokument | Moduł |
|---|---|---:|
| KK | Karta klienta | 1 |
| KP | Karta produktu | 1 |
| AK | Arkusz kalkulacyjny | 1 |
| ZK | Zamówienie klienta | 2 |
| ZP | Zlecenie produkcyjne | 2 |
| PZL | Protokół zatwierdzenia zlecenia | 2 |
| RZ | Raport zmianowy operatora | 3 |
| RN | Raport nastawiacza | 3 |
| PK | Protokół korekty | 3 |
| RKR | Rozliczenie kosztu rzeczywistego | 3 |
| WP | Wpis planu produkcyjnego | 4 |
| TPP | Tygodniowy plan produkcji | 4 |
| KF | Karta formy | 5 |
| ZAF | Zgłoszenie awarii formy | 5 |
| PSF | Protokół serwisu formy | 5 |
| KT | Karta technologiczna | 6 |
| KL | Karta logistyczna | 7 |
| SP | Specyfikacja paletowa | 7 |
| ZM | Zapotrzebowanie materiałowe | 8 |
| PZ | Przyjęcie zewnętrzne | 8 |
| WZ | Wydanie zewnętrzne | 8 |
| FZ | Faktura zakupu | 8 |
| ALR | Alert rentowności | 9 |

## 10. Trasy dokumentów

### 10.1. Zamówienie klienta

`ZK` trafia do:

- modułu 2 — tworzy zlecenie;
- modułu 8 — generuje zapotrzebowanie materiałowe.

### 10.2. Zlecenie produkcyjne

`ZP` trafia do:

- modułu 4 — tworzy wpis planu;
- modułu 5 — rezerwuje formę;
- modułu 6 — wskazuje kartę technologiczną;
- modułu 7 — pobiera kartę logistyczną;
- modułu 8 — rezerwuje materiały.

### 10.3. Raport zmianowy

`RZ` trafia do:

- modułu 3 — aktualizuje koszt rzeczywisty;
- modułu 4 — koryguje plan;
- modułu 5 — aktualizuje licznik cykli formy;
- modułu 6 — przekazuje uwagi;
- modułu 8 — zdejmuje materiał ze stanu.

### 10.4. Rozliczenie kosztu

`RKR` trafia do:

- modułu 1 — oznacza kalkulację jako nieaktualną;
- modułu 9 — zasila analitykę.

### 10.5. Faktura zakupu

`FZ` trafia do:

- modułu 1 — aktualizuje cenę materiału;
- modułu 9 — aktualizuje analitykę.

### 10.6. Zgłoszenie awarii

`ZAF`:

- zmienia status formy;
- oznacza plan jako zagrożony.

### 10.7. Protokół serwisu

`PSF`:

- przywraca status sprawnej formy;
- zwalnia blokadę w planie.

## 11. Potwierdzenie przekazania dokumentu

Po złożeniu dokumentu pojawia się panel:

```text
DOKUMENT PRZEKAZANY
```

Panel pokazuje kolejno wszystkie moduły docelowe. Przy każdym widnieje opis skutku oraz przycisk „zobacz”.

Moduły docelowe otrzymują:

- czerwoną kropkę z licznikiem;
- pasek „PRZYJĘTO DOKUMENTY”;
- opis zmienionych danych;
- żółte podświetlenie pól.

## 12. Moduł 1 — Kartoteka i kalkulacja

### 12.1. Podwidoki

- Kartoteka;
- Kalkulacja;
- Klienci;
- Archiwum dokumentów.

### 12.2. Kartoteka produktów

Obsługuje sześć produktów:

- P-101 — Miska dla psa 900 ml;
- P-102 — Szarpak Rope;
- P-103 — Gryzak kość mały;
- P-104 — Klips do smyczy;
- P-105 — Rączka RAIS 2 – elastomer;
- P-106 — Pokrywa kuwety maxi.

Tabela pokazuje:

- status;
- indeks;
- nazwę;
- krotność;
- czas cyklu;
- cenę;
- koszt jednostkowy;
- narzut;
- marżę na maszynogodzinę;
- materiał główny.

Tabela jest sortowalna.

### 12.3. Karta produktu

Pokazuje m.in.:

- wagę netto i brutto;
- formę;
- maszynę;
- technologię;
- logistykę;
- recepturę;
- cenę materiału;
- status kalkulacji.

### 12.4. Kalkulacja

Działa dla wszystkich sześciu produktów.

Pokazuje:

- dane techniczne;
- recepturę;
- barwnik;
- maszynę i stawkę;
- zakładaną brakowość;
- rozbicie kosztu;
- koszt materiału;
- koszt barwnika;
- koszt maszyny;
- narzut na braki;
- koszt jednostkowy;
- cenę;
- marżę;
- narzut procentowy;
- wydajność;
- marżę na maszynogodzinę.

Suwak zmiany cen tworzyw działa od `-20%` do `+40%`.

Zmianę można zastosować do całego portfolio.

### 12.5. Reakcja na koszt rzeczywisty

Po zatwierdzeniu `RKR/2026/0218` kalkulacja P-105 otrzymuje status:

```text
NIEAKTUALNA
```

System pokazuje:

- koszt kalkulacyjny: `0,8406 zł`;
- koszt rzeczywisty: `1,1783 zł`;
- cenę klienta: `1,1500 zł`;
- sugerowaną cenę: `1,6119 zł`.

### 12.6. Klienci

W demonstratorze są trzy firmy:

- PetLine Polska;
- Animal House;
- ZooMarket Dystrybucja.

PetLine ma dwa adresy dostawy. Jeden wymaga potwierdzenia przed realizacją.

## 13. Moduł 2 — Zlecenia produkcyjne

### 13.1. Podwidoki

- Zamówienia;
- Zlecenia;
- Szarże produkcyjne;
- Zatwierdzanie;
- Archiwum dokumentów.

### 13.2. Zamówienie przewodnie

```text
ZK/2026/077
```

Dotyczy:

- klienta PetLine Polska;
- produktu P-105;
- 5 000 sztuk;
- pięciu wariantów kolorystycznych;
- 1 000 sztuk każdego koloru;
- ceny 1,1500 zł/szt.

### 13.3. Zlecenia

Przełączalne są:

- ZP/2026/218 — P-105;
- ZP/2026/221 — P-102;
- ZP/2026/224 — P-104.

Karta zlecenia pokazuje:

- zamówienie źródłowe;
- produkt;
- maszynę;
- formę;
- kartę technologiczną;
- kartę logistyczną;
- status;
- ilości planowane, dobre i wadliwe.

### 13.4. Szarże produkcyjne

Rejestr zawiera 54 szarże z ostatnich 60 dni:

- po 9 dla każdego produktu;
- 52 zakończone;
- 1 w realizacji;
- 1 wstrzymaną.

Każda szarża zawiera:

- numer;
- zlecenie;
- datę i godzinę startu;
- datę zakończenia;
- zmianę;
- produkt;
- maszynę;
- formę;
- partię surowca;
- partię barwnika;
- operatora;
- nastawiacza;
- ilość planowaną;
- ilość dobrą;
- ilość wadliwą;
- rzeczywisty czas cyklu;
- status;
- status jakości;
- numer raportu zmianowego.

Rejestr umożliwia:

- wyszukiwanie po szarży, zleceniu, partii i operatorze;
- filtrowanie według produktu;
- filtrowanie według statusu;
- otwarcie szczegółowej karty;
- prześledzenie pełnej identyfikowalności.

Ścieżka identyfikowalności:

```text
wyrób
→ zlecenie
→ szarża
→ partie materiałów
→ maszyna i forma
→ operator
→ raport zmianowy
```

## 14. Moduł 3 — Raport zmianowy i koszt rzeczywisty

### 14.1. Podwidoki

- Panel operatora;
- Nastawiacz;
- Korekta;
- Koszt rzeczywisty;
- Historia produkcji;
- Archiwum dokumentów.

### 14.2. Panel operatora

Formularz pozwala:

- wybrać zlecenie;
- wybrać zmianę;
- wybrać operatora;
- rejestrować sztuki dobre i wadliwe;
- rozbić ilości na kolory;
- wpisać czas cyklu;
- wybrać charakter pracy;
- zarejestrować przezbrojenie;
- dodać uwagi;
- złożyć raport.

Panel ma duże przyciski odpowiednie do obsługi na hali.

### 14.3. Raport przewodni

`RZ/2026/0431` zawiera:

- zmianę III;
- operatora M. Nowaka;
- maszynę W4;
- formę F-001;
- 1 500 dobrych sztuk;
- 318 wadliwych;
- cykl 39 s;
- narastające przezbrojenie 4,5 h;
- uwagę o zacinaniu wypychacza.

### 14.4. Raport nastawiacza

Pokazuje:

- nastawiacza;
- maszynę i formę;
- początek i koniec przezbrojenia;
- rzeczywisty czas;
- uwagi dla technologii i kolejnej zmiany.

### 14.5. Korekty

Protokół korekty zawiera:

- zmienione pole;
- wartość przed;
- wartość po;
- powód;
- autora;
- datę i godzinę.

### 14.6. Koszt rzeczywisty

Pokazuje:

- koszt kalkulacyjny;
- koszt rzeczywisty;
- cenę klienta;
- procent odchylenia;
- wynik na sztuce;
- wynik całego zlecenia;
- wykres waterfall;
- wpływ roczny;
- sugerowaną cenę.

### 14.7. Historia produkcji

Zawiera 13 procesów historycznych:

- P-101 — 2;
- P-102 — 2;
- P-103 — 2;
- P-104 — 2;
- P-105 — 3;
- P-106 — 2.

Każdy zapis pokazuje:

- zlecenie;
- datę;
- produkt;
- maszynę;
- formę;
- historyczną wersję technologii;
- ilość zamówioną;
- sztuki dobre i wadliwe;
- rzeczywisty cykl;
- brakowość;
- koszt;
- wynik;
- operatora;
- status.

## 15. Moduł 4 — Plan produkcyjny

Plan przedstawia sześć maszyn:

- W1;
- W2;
- W3;
- W4;
- W5;
- W6.

Pokazuje:

- zlecenia;
- rezerwacje estymowane;
- planowane przezbrojenia;
- statusy;
- zagrożenia;
- aktualizację czasu po RZ;
- blokadę wynikającą z awarii formy.

Po raporcie P-105:

- planowane przezbrojenie 3,0 h zmienia się na 4,5 h;
- zlecenie otrzymuje status zagrożenia;
- plan uwzględnia serwis F-001.

## 16. Moduł 5 — Karta formy

### 16.1. Formy aktywne

W systemie są:

- F-001 — forma Rączki RAIS 2;
- F-002 — forma Szarpaka Rope;
- F-003 — forma rodziny klips/gryzak;
- F-004 — forma Miski 900 ml;
- F-005 — forma Pokrywy kuwety;
- F-006 — forma testowa wkładek TPE.

Można przełączać wszystkie formy.

### 16.2. Dane paszportu

Karta pokazuje:

- numer;
- nazwę;
- status;
- wymiary;
- wagę;
- pole odkładcze;
- lokalizację;
- licznik cykli;
- produkty;
- metodę przezbrojenia;
- czas przezbrojenia;
- historię awarii.

### 16.3. Forma wieloproduktowa

F-003 obsługuje:

- P-103;
- P-104.

Karta opisuje osobne metody przezbrojenia.

### 16.4. Formy wycofane

W systemie zachowano:

- F-007 — forma Rączki RAIS 1;
- F-008 — forma klipsa 8-gniazdowa;
- F-009 — forma Miski 700 ml.

Paszport wycofanej formy zawiera:

- końcowy licznik cykli;
- okres eksploatacji;
- datę wycofania;
- przyczynę wycofania;
- historię awarii;
- historię napraw;
- produkty historyczne;
- lokalizację archiwalną.

Wycofana forma ma komunikat:

```text
FORMA WYCOFANA — BLOKADA UŻYCIA
```

Pozostaje w systemie jako źródło danych historycznych.

## 17. Moduł 6 — Karta technologiczna

Każdy produkt ma kartę technologiczną.

P-105 ma trzy wersje.

Karta pokazuje:

- produkt;
- maszynę;
- formę;
- wersję;
- status;
- datę obowiązywania;
- temperaturę;
- ciśnienie;
- docisk;
- chłodzenie;
- docelowy cykl;
- uwagi.

Uwagi z raportu zmianowego trafiają do karty P-105.

Przełączanie działa dla P-101–P-106.

## 18. Moduł 7 — Karta logistyczna

Karty działają dla wszystkich sześciu produktów.

Pokazują:

- opakowanie;
- liczbę sztuk w kartonie;
- kartony na warstwę;
- liczbę warstw;
- sztuki na palecie;
- wysokość palety;
- limit wysokości;
- masę produktu;
- operacje dodatkowe;
- wynik kontroli palety.

Przykład P-105:

- 500 sztuk w kartonie;
- 8 kartonów na warstwę;
- 5 warstw;
- kontrola limitu przewoźnika;
- pakowanie w woreczki;
- etykieta klienta.

## 19. Moduł 8 — Magazyn i rezerwacje

### 19.1. Podwidoki

- Stany;
- Rezerwacje;
- PZ/WZ;
- Faktury zakupu;
- Archiwum dokumentów.

### 19.2. Stany

Rejestr obejmuje:

- tworzywa;
- barwniki;
- opakowania;
- palety.

Pokazuje:

- stan fizyczny;
- rezerwacje;
- stan dostępny;
- minimum;
- lokalizację;
- alert niedoboru.

### 19.3. Zapotrzebowanie

`ZM/2026/0218` pokazuje:

- wymagane materiały;
- rezerwację;
- niedobór;
- ilość do zamówienia;
- opakowania.

### 19.4. PZ i WZ

Moduł zawiera przykładowe:

- przyjęcie TPE-S 4055;
- wydanie dla PetLine Polska.

### 19.5. Faktury

`FZ/2026/0619` podnosi cenę TPE-S 4055:

```text
18,00 zł/kg → 19,40 zł/kg
```

Po zatwierdzeniu:

- moduł 1 otrzymuje nową cenę;
- moduł 9 otrzymuje informację analityczną;
- kalkulacje produktów zawierających M1 wymagają ponownej oceny.

## 20. Moduł 9 — Analityka zarządcza

### 20.1. Podwidoki

- Pulpit;
- Rentowność portfela;
- Odchylenia;
- Archiwum dokumentów.

### 20.2. Pulpit

Pokazuje:

- koszt planowany;
- koszt rzeczywisty;
- odchylenie;
- wynik zlecenia;
- perspektywę produktu;
- perspektywę klienta;
- perspektywę maszyny;
- alert rentowności.

### 20.3. Rentowność portfela

Porównuje:

- ranking według narzutu procentowego;
- ranking według marży na maszynogodzinę.

Pokazuje, że produkt o słabszym narzucie procentowym może lepiej wykorzystywać ograniczony czas maszyny.

### 20.4. Odchylenia

Tabela pokazuje:

- zlecenie;
- produkt;
- koszt planowany;
- koszt rzeczywisty;
- odchylenie;
- wynik.

## 21. Zarządzanie dostępem

### 21.1. Charakter funkcji

Zarządzanie dostępem jest demonstracyjną symulacją wieloużytkownikowego systemu.

Nie jest produkcyjnym uwierzytelnianiem.

### 21.2. Użytkownicy

- Jakub Majchrzak — CEO, administrator;
- Zofia Kowalska — operatorka;
- Anna Nowak — operatorka;
- Bartosz Wiśniewski — nastawiacz;
- Piotr Wójcik — kierownik produkcji;
- Stanisław Kaczmarek — narzędziowiec;
- Karolina Majewska — handlowiec.

### 21.3. Poziomy dostępu

- `BRAK`;
- `WGLĄD`;
- `EDYCJA`;
- `ADMIN`.

### 21.4. Wcielanie się w użytkownika

W górnym pasku znajduje się selektor:

```text
Wciel się…
```

Po wybraniu osoby:

- zmienia się aktywny użytkownik;
- moduły mogą zostać zablokowane;
- moduły mogą przejść w tryb tylko do odczytu;
- przyciski niedozwolonych działań są wyłączone;
- system pokazuje przyczynę blokady.

### 21.5. Uprawnienia dokumentowe

Operator:

- edytuje RZ;
- może utworzyć ZAF.

Nastawiacz:

- edytuje RN;
- może utworzyć ZAF;
- nie może złożyć RZ.

Kierownik:

- edytuje ZP;
- zatwierdza PZL;
- wykonuje PK;
- zatwierdza RKR;
- edytuje plan.

Narzędziownia:

- edytuje KF;
- obsługuje ZAF;
- zatwierdza PSF.

Handlowiec:

- edytuje KK;
- edytuje KP;
- obsługuje AK;
- tworzy ZK;
- nie ma dostępu do raportów hali.

Administrator:

- ma pełny dostęp.

## 22. Archiwum dokumentów

W systemie znajduje się 69 dokumentów archiwalnych z okresu styczeń–czerwiec 2026.

Archiwum jest dostępne w każdym z dziewięciu modułów.

Funkcje:

- wyszukiwanie po numerze;
- wyszukiwanie po autorze;
- wyszukiwanie po zleceniu;
- wyszukiwanie po treści;
- filtr symbolu;
- filtr statusu;
- lista dokumentów;
- pełny podgląd;
- trasa dokumentu;
- eksport do Excela.

Archiwum rozróżnia:

- dokumenty zatwierdzone;
- dokumenty skorygowane.

Oryginalny dokument pozostaje niezmienny. Korekta jest osobnym zdarzeniem.

## 23. Eksport do Excela

Każdy dokument renderowany przez `DocumentSheet` ma przycisk:

```text
Eksport do Excel
```

Dotyczy to:

- dokumentów bieżących;
- dokumentów archiwalnych;
- kart produktów;
- kart klientów;
- szarż;
- kart form;
- kart technologicznych;
- kart logistycznych;
- zleceń;
- raportów;
- dokumentów magazynowych;
- alertów.

### 23.1. Format

Generowany jest prawdziwy plik:

```text
.xlsx
```

Plik jest rozpoznawany jako Microsoft Excel 2007+.

### 23.2. Arkusze

Każdy eksport zawiera:

1. `Dokument`;
2. `Obliczenia`;
3. `Metryka`.

### 23.3. Arkusz Dokument

Zawiera:

- nazwę;
- numer;
- symbol;
- status;
- autora;
- rolę;
- datę;
- zmianę;
- zlecenie;
- pola widoczne w aplikacji.

### 23.4. Arkusz Obliczenia

Zawiera aktywne formuły Excela odpowiednie dla rodzaju dokumentu.

Przykłady:

- koszt materiału;
- koszt barwnika;
- koszt maszyny;
- koszt jednostkowy;
- brakowość;
- marża;
- narzut;
- wydajność;
- czas produkcji;
- wykonanie zlecenia;
- licznik cykli formy;
- sztuki na palecie;
- wysokość palety;
- kontrola limitu;
- stan dostępny;
- niedobór;
- wartość wydania.

Zmiana danych wejściowych w Excelu powoduje ponowne przeliczenie formuł.

### 23.5. Arkusz Metryka

Zawiera:

- datę eksportu;
- dokument źródłowy;
- autora;
- status;
- moduł;
- informację o aktywnych formułach.

## 24. Dane podstawowe demonstratora

### 24.1. Produkty

6 produktów.

### 24.2. Maszyny

6 wtryskarek.

### 24.3. Materiały

6 materiałów:

- trzy tworzywa;
- trzy barwniki.

### 24.4. Klienci

3 klientów.

### 24.5. Formy

9 form:

- 6 aktywnych lub serwisowych;
- 3 wycofane.

### 24.6. Technologia

6 kart technologicznych. P-105 ma trzy wersje.

### 24.7. Logistyka

6 kart logistycznych i 4 definicje opakowań.

### 24.8. Zlecenia

3 główne zlecenia demonstracyjne.

### 24.9. Szarże

54 szarże z 60 dni.

### 24.10. Historia produkcji

13 historycznych realizacji.

### 24.11. Archiwum

69 archiwalnych dokumentów.

### 24.12. Użytkownicy

7 imiennych kont demonstracyjnych.

## 25. Obliczenia kosztowe

### 25.1. Cena receptury

Cena receptury jest średnią ważoną:

```text
suma(udział materiału × cena materiału)
```

### 25.2. Koszt materiału

```text
waga brutto [kg] × cena receptury [zł/kg]
```

### 25.3. Koszt barwnika

```text
waga brutto [kg] × dozowanie [%] × cena barwnika [zł/kg]
```

### 25.4. Koszt maszyny

```text
stawka maszyny / 3600 × czas cyklu / krotność
```

### 25.5. Koszt jednostkowy

```text
koszt bezpośredni / (1 − brakowość)
```

### 25.6. Marża

```text
cena sprzedaży − koszt jednostkowy
```

### 25.7. Narzut

```text
marża / koszt jednostkowy
```

### 25.8. Wydajność

```text
3600 / czas cyklu × krotność
```

### 25.9. Marża na maszynogodzinę

```text
marża jednostkowa × wydajność
```

### 25.10. Koszt przezbrojenia

```text
czas przezbrojenia × stawka maszyny / dobre sztuki
```

## 26. Kontrolne wyniki produktów

| Produkt | Koszt jednostkowy | Narzut | Wydajność | Marża/h |
|---|---:|---:|---:|---:|
| P-101 | 2,2467 zł | 42,4% | 75,0/h | 71,5 zł/h |
| P-102 | 1,4413 zł | 35,3% | 189,5/h | 96,4 zł/h |
| P-103 | 0,3963 zł | 31,2% | 654,5/h | 81,0 zł/h |
| P-104 | 0,0682 zł | 29,1% | 5 236,4/h | 103,8 zł/h |
| P-105 | 0,8406 zł | 36,8% | 225,0/h | 69,6 zł/h |
| P-106 | 4,1460 zł | 54,4% | 50,0/h | 112,7 zł/h |

## 27. Rozliczenie P-105

```text
Zlecenie: ZP/2026/218
Produkt: P-105
Koszt kalkulacyjny: 0,8406 zł
Koszt rzeczywisty: 1,1783 zł
Cena klienta: 1,1500 zł
Odchylenie: +40,2%
Wynik na sztuce: −0,0283 zł
Wynik zlecenia: −133,56 zł
Sugerowana cena: 1,6119 zł
```

Waterfall wynikający z obecnych formuł:

```text
cena tworzywa:     +0,0286 zł
wydłużony cykl:    +0,0952 zł
brakowość/efekt:   +0,1234 zł
przezbrojenie:     +0,0906 zł
razem:             +0,3377 zł
```

## 28. Reset demonstratora

Przycisk `Reset demo`:

- przywraca Mapę systemu;
- przywraca administratora;
- czyści skrzynki odbiorcze;
- przywraca status kalkulacji;
- resetuje zmiany planu;
- resetuje status formy;
- resetuje rozchód materiału;
- usuwa demonstracyjne potwierdzenia tras.

Reset nie przeładowuje strony.

## 29. Weryfikacja techniczna

Aplikacja została sprawdzona:

- przez TypeScript;
- przez produkcyjny build Next.js;
- przez skrypt formuł;
- w Chromium przy szerokości 1366 px;
- na lokalnym eksporcie statycznym;
- na publicznej domenie.

Sprawdzone interakcje:

- moduły 0–9;
- Mapa systemu;
- raport RZ;
- rozliczenie RKR;
- faktura FZ;
- Reset demo;
- przełączanie produktów;
- przełączanie form;
- karty technologiczne;
- karty logistyczne;
- historia produkcji;
- szarże;
- archiwa;
- role i uprawnienia;
- eksport Excel.

## 30. Świadome ograniczenia

### 30.1. Brak trwałości

Stan jest przechowywany w pamięci przeglądarki.

Odświeżenie lub reset przywraca stan początkowy.

### 30.2. Brak backendu

Nie ma:

- API;
- serwera aplikacyjnego;
- bazy danych;
- kolejki zdarzeń;
- integracji przemysłowej.

### 30.3. Brak produkcyjnego logowania

Wcielanie się w użytkownika jest funkcją demonstracyjną.

Produkcja wymagałaby:

- logowania;
- bezpiecznego przechowywania kont;
- haseł lub SSO;
- sesji;
- audytu serwerowego;
- egzekwowania uprawnień po stronie API;
- blokady manipulacji po stronie klienta.

### 30.4. Brak prawdziwej integracji z maszynami

Czas cyklu i dane hali są symulowane.

### 30.5. Brak integracji magazynowej

PZ, WZ, FZ i stany są danymi demonstracyjnymi.

### 30.6. Dane historyczne

Historia, szarże i archiwa są kontrolowanymi danymi seed przygotowanymi na potrzeby prezentacji.

### 30.7. Zakres ekranów

Interfejs jest projektowany przede wszystkim pod prezentację na ekranie 1366 px lub szerszym.

## 31. Co jest już przedstawione wiarygodnie

- struktura modułowa;
- dokumentowy sposób pracy;
- przepływ informacji;
- zależności między działami;
- kartoteka produktu;
- koszt teoretyczny;
- koszt rzeczywisty;
- pętla kosztowa;
- plan;
- forma i narzędziownia;
- technologia;
- logistyka;
- magazyn;
- analityka;
- użytkownicy i role;
- archiwum;
- szarże;
- historia;
- Excel z formułami.

## 32. Co byłoby wymagane przed wdrożeniem produkcyjnym

1. Rozpoznanie procesów w zakładzie.
2. Potwierdzenie modelu danych.
3. Potwierdzenie definicji kosztów.
4. Projekt bazy danych.
5. Backend i API.
6. Produkcyjne logowanie.
7. Role i uprawnienia egzekwowane serwerowo.
8. Audyt.
9. Integracja z maszynami.
10. Integracja magazynowa.
11. Obsługa plików i zdjęć.
12. Kopie zapasowe.
13. Monitoring.
14. Testy jednostkowe i integracyjne.
15. Migracje danych.
16. Pilotaż na hali.
17. Procedura wsparcia.

## 33. Podsumowanie

Aktualny P12 jest rozbudowanym, interaktywnym demonstratorem dziewięciomodułowego systemu zarządzania produkcją.

Najważniejsze wartości demonstratora:

- pokazuje cały obieg dokumentów;
- pokazuje źródło każdej ważnej informacji;
- zamyka pętlę kosztową;
- łączy koszt z rzeczywistym wykonaniem;
- pozwala analizować produkt, klienta i maszynę;
- pokazuje kontrolę dostępu wielu użytkowników;
- zachowuje historię form, produkcji, szarż i dokumentów;
- umożliwia eksport dokumentów do Excela z aktywnymi formułami.

Najważniejsza historia biznesowa pozostaje następująca:

> Firma może poprawnie policzyć koszt teoretyczny, ale bez automatycznego powrotu danych z zakończonej produkcji nie wie, czy nadal zarabia. P12 pokazuje, jak raport z hali zmienia koszt, cenę, plan, formę, magazyn oraz decyzję zarządczą.
