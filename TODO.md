# TODO / świadomie pominięte

Rzeczy poza budżetem 2–3 dni lub poza zakresem specyfikacji demo. Nic z tego nie
jest wymagane do przeprowadzenia prezentacji wg `SCENARIUSZ.md`.

- **Responsywność poniżej ~1280 px.** Layout jest projektowany pod laptop
  prezentacyjny (kryterium akceptacji: 1366 px). Na węższych ekranach
  (tablet, telefon) kolumny będą się ściskać nieoptymalnie.
- **Dostępność (a11y).** Podstawowe `aria-label` tam gdzie trywialne (kropki
  statusu), ale brak pełnego audytu klawiaturowego/screen-readerowego.
- **Trwałość stanu.** Zgodnie ze specyfikacją: brak `localStorage`, stan żyje
  tylko w pamięci Zustand — odświeżenie strony przeglądarki resetuje demo do
  stanu początkowego (to samo robi przycisk "Reset demo", tylko bez przeładowania).
- **Ekran 3 jako symulacja, nie źródło prawdy dla Ekranu 4.** Liczniki
  postępu na Raporcie zmianowym to niezależna, ilustracyjna symulacja "na
  żywo" — nie zasilają (i nie mogą zmienić) zaplombowanych wyników rozliczeń
  na Ekranie 4, które są ustalonymi danymi seed z sekcji 4 specyfikacji.
- **"Wpływ roczny przy 12 produkcjach"** to hipotetyczna ekstrapolacja
  (× 12), a nie prognoza. Zaokrąglana do pełnych złotych przed odejmowaniem,
  żeby suma zawsze zgadzała się z tym, co widać na ekranie przy sprawdzeniu
  kalkulatorem.
- **Rozbicie odchylenia (waterfall) — składowa "brakowość" jest wartością
  domykającą** (residual), nie niezależnym marginalnym przeliczeniem — tak
  jak dopuszcza specyfikacja ("dopasuj składową brakowości"), żeby cztery
  słupki zawsze sumowały się dokładnie do całkowitego odchylenia.
- **Brak trybu ciemnego / wydruku.** Jeden, stały jasny motyw przemysłowy.
- **Brak testów jednostkowych** poza `scripts/verify-calculations.ts`
  (zgodnie z sekcją 10 specyfikacji).
