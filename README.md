# Controlling produkcji — demo dla wtryskowni

Demo sprzedażowe systemu klasy MES/controlling produkcji dla producenta
akcesoriów dla zwierząt (wtryskownia tworzyw sztucznych). Pokazuje na
sześciu realnych produktach i trzech zakończonych zleceniach, że koszt
rzeczywisty potrafi znacząco odbiegać od kalkulacji (materiał, cykl,
brakowość, przezbrojenie), że produkt uznawany za rentowny może w
rzeczywistości przynosić stratę, oraz że ranking rentowności portfela
odwraca się, gdy marżę procentową zastąpić marżą na maszynogodzinę.
Świadomie **nie zawiera**: bazy danych, backendu, API, logowania, testów
jednostkowych (poza skryptem weryfikującym formuły) ani obsługi przypadków
spoza danych seed — to narzędzie do jednej, 4-minutowej rozmowy sprzedażowej
(`SCENARIUSZ.md`), a nie produkt. Pełna lista świadomych uproszczeń: `TODO.md`.

## Uruchomienie lokalnie

```bash
npm install
npm run dev
```

Aplikacja wystartuje na `http://localhost:8507`. Skrypt weryfikujący formuły
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
