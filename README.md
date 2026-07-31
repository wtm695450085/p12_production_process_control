# P12 — demonstrator sterowania produkcją dla wtryskowni

Demo sprzedażowe dziewięciomodułowego systemu zarządzania produkcją dla
wtryskowni tworzyw sztucznych. Jest oparte na firmowych dokumentach i ich
widocznych trasach: od karty produktu i zamówienia, przez plan, formę,
technologię, logistykę, magazyn i raport zmianowy, aż do rzeczywistego
kosztu i analityki. Główna historia pokazuje, jak raport z hali zamyka
pętlę kosztową i oznacza wcześniejszą kalkulację jako nieaktualną.
Świadomie **nie zawiera**: bazy danych, backendu, API, logowania, testów
jednostkowych (poza skryptem weryfikującym formuły) ani obsługi przypadków
spoza danych seed — to narzędzie do jednej, 4-minutowej rozmowy sprzedażowej
(`SCENARIUSZ.md`), a nie produkt produkcyjny. Cały stan żyje w pamięci
przeglądarki i wraca do kontrolowanego początku po „Reset demo”.
Pełna lista świadomych uproszczeń: `TODO.md`.

## Uruchomienie lokalnie

```bash
npm install
npm run dev
```

Aplikacja wystartuje na `http://localhost:8507`. Klawisze `0`–`9`
przełączają moduły, a `M` otwiera Mapę systemu. Skrypt weryfikujący formuły
kalkulacyjne (sekcja 4 specyfikacji) można uruchomić osobno:

```bash
npm run verify
```

## Budowanie do plików statycznych

```bash
npm run build
```

Dzięki `output: 'export'` w `next.config.ts` wynik trafia do katalogu `out/`
jako czysty HTML/CSS/JS — bez potrzeby uruchamiania Node.js w produkcji.

## Postawienie na VPS za nginxem

1. Skopiuj katalog `out/` na serwer, np. do `/var/www/controlling-demo`.
2. Konfiguracja nginx (przykład):

   ```nginx
   server {
       listen 8507;
       server_name _;
       root /var/www/controlling-demo;
       index index.html;

       location / {
           try_files $uri $uri.html $uri/ =404;
       }
   }
   ```

3. `nginx -t && systemctl reload nginx`.

Alternatywnie, bez nginx, katalog `out/` można wystawić dowolnym serwerem
plików statycznych (np. `npx serve out -l 8507`) — aplikacja nie ma żadnych
zależności server-side.

## Języki

Interfejs działa po polsku i po angielsku. Przełącznik `PL / EN` znajduje się w
pasku górnym obok selektora użytkownika; zmiana jest natychmiastowa i przeżywa
`Reset demo`. Tłumaczenia trzyma `lib/i18n.ts` (słownik PL → EN, kluczem jest
polski tekst źródłowy) oraz warianty `pick(lang, …)` w `lib/tkw.ts` i
`lib/tkw-sources.ts`, gdzie zdania składane są z liczb. Separator dziesiętny
idzie za językiem; walutą pozostaje złoty.
