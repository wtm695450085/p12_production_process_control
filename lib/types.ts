export type MaterialType = "tworzywo" | "barwnik";

export interface Material {
  id: string;
  symbol: string;
  type: MaterialType;
  priceZlKg: number;
}

export interface Machine {
  id: string;
  name: string;
  /**
   * Stawka pełna maszynogodziny — nie zmieniać bez przeliczenia tablicy
   * kontrolnej w `scripts/verify-calculations.ts`.
   */
  rateZlH: number;
  /**
   * Rozbicie stawki pełnej na składniki TKW. Niezmiennik pilnowany testem:
   * machineRateZlH + laborRateZlH + overheadRateZlH === rateZlH.
   */
  machineRateZlH: number;
  laborRateZlH: number;
  overheadRateZlH: number;
}

export interface RecipeComponent {
  materialId: string;
  share: number; // 0..1
}

export interface Product {
  id: string;
  name: string;
  weightNetG: number;
  weightGrossG: number;
  cavities: number;
  cycleTimeS: number;
  recipe: RecipeComponent[];
  colorantId: string;
  colorantDosagePct: number;
  machineId: string;
  scrapRatePct: number;
  priceZl: number;
  colors?: string[];
}

export type ShiftLabel = "I" | "II" | "III";

export type WorkMode = "produkcja" | "przezbrojenie" | "przestoj";

export type OrderStatus = "zielony" | "zolty" | "czerwony";

export interface ProductionOrder {
  id: string;
  productId: string;
  orderedQty: number;
  goodQty: number;
  actualCycleTimeS: number;
  actualScrapRatePct: number;
  actualMaterialPriceOverrides?: Record<string, number>;
  setupTimeH: number;
  date: string;
}

export interface CostOverrides {
  cycleTimeS?: number;
  scrapRatePct?: number;
  materialPriceOverrides?: Record<string, number>;
}

export interface DirectCostBreakdown {
  materialCost: number;
  colorantCost: number;
  machineCost: number;
  total: number;
}

export interface ProductEconomics {
  direct: DirectCostBreakdown;
  unitCost: number;
  margin: number;
  markupPct: number;
  hourlyOutput: number;
  marginPerMachineHour: number;
}

export interface WaterfallStep {
  shortLabel: string;
  label: string;
  impact: number;
}

export interface OrderSettlement {
  order: ProductionOrder;
  product: Product;
  calc: ProductEconomics;
  actualDirect: DirectCostBreakdown;
  actualUnitCost: number;
  setupCostPerUnit: number;
  deviationPct: number;
  resultPerUnit: number;
  resultTotal: number;
  status: OrderStatus;
  waterfall: WaterfallStep[];
  suggestedNewPrice: number;
}

export type ModuleId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type AccessLevel = "none" | "view" | "edit" | "admin";

export interface SystemUser {
  id: string;
  name: string;
  initials: string;
  /** Ścieżka do zdjęcia w /public/team. Brak = awatar z inicjałami. */
  photo?: string;
  jobTitle: string;
  roleName: string;
  active: boolean;
  permissions: Record<ModuleId, AccessLevel>;
  editableDocuments: DocumentSymbol[];
}

export type DocumentSymbol =
  | "KK"
  | "KP"
  | "AK"
  | "ZK"
  | "ZP"
  | "PZL"
  | "RZ"
  | "RN"
  | "PK"
  | "RKR"
  | "WP"
  | "TPP"
  | "KF"
  | "ZAF"
  | "PSF"
  | "KT"
  | "KL"
  | "SP"
  | "ZM"
  | "PZ"
  | "WZ"
  | "FZ"
  | "ALR";

export type DocumentStatus = "roboczy" | "zlozony" | "zatwierdzony" | "skorygowany";

export interface DocumentMeta {
  id: string;
  symbol: DocumentSymbol;
  number: string;
  moduleId: ModuleId;
  author: string;
  authorRole: string;
  date: string;
  status: DocumentStatus;
  shift?: ShiftLabel;
  relatedOrderId?: string;
}

export interface ArchivedDocument {
  meta: DocumentMeta;
  title: string;
  subject: string;
  summary: string;
  amount?: string;
  sourceDocument?: string;
}

export interface DocumentRouteTarget {
  moduleId: ModuleId;
  effect: string;
}

export interface DocumentRoute {
  symbol: DocumentSymbol;
  documentName: string;
  sourceModuleId: ModuleId;
  targets: DocumentRouteTarget[];
}

export interface CustomerAddress {
  id: string;
  label: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  isDefault: boolean;
  requiresConfirmation?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  taxId: string;
  contactPerson: string;
  phone: string;
  email: string;
  paymentTermsDays: number;
  transportTerms: string;
  addresses: CustomerAddress[];
}

export type MoldStatus = "sprawna" | "produkcja" | "serwis" | "po_odbiorze" | "wycofana";

export interface MoldIncident {
  id: string;
  date: string;
  productionOrderId: string;
  description: string;
  resolution: string;
}

export interface MoldProductLink {
  productId: string;
  changeoverMethod: string;
  standardSetupTimeH: number;
}

export interface Mold {
  id: string;
  name: string;
  dimensionsMm: [number, number, number];
  weightKg: number;
  depositingAreaMm: [number, number];
  cycleCounter: number;
  status: MoldStatus;
  location: string;
  products: MoldProductLink[];
  incidents: MoldIncident[];
  commissionedAt?: string;
  retiredAt?: string;
  retirementReason?: string;
  /**
   * Ekonomia formy — podstawa amortyzacji na strzał w składniku 5 TKW.
   * Opcjonalne: forma bez tych danych nie ma wyliczanej amortyzacji, a raport
   * właścicielski pokazuje wtedy jawne „brak danych" zamiast zmyślonej liczby.
   */
  replacementCostZl?: number;
  lifetimeCycles?: number;
}

export interface ProductionHistoryRecord {
  id: string;
  date: string;
  productId: string;
  machineId: string;
  moldId: string;
  technologyVersion: number;
  orderedQty: number;
  goodQty: number;
  badQty: number;
  actualCycleTimeS: number;
  scrapRatePct: number;
  actualUnitCost: number;
  unitPriceZl: number;
  resultTotalZl: number;
  operator: string;
  status: "zatwierdzone" | "skorygowane";
}

export interface ProductionBatch {
  id: string;
  productionOrderId: string;
  productId: string;
  startedAt: string;
  finishedAt?: string;
  shift: ShiftLabel;
  machineId: string;
  moldId: string;
  materialLot: string;
  colorantLot: string;
  operator: string;
  setter: string;
  plannedQty: number;
  goodQty: number;
  badQty: number;
  actualCycleTimeS: number;
  status: "zakonczona" | "w_realizacji" | "wstrzymana";
  shiftReportNumber: string;
  qualityStatus: "zwolniona" | "warunkowo" | "oczekuje";
  /**
   * Numery dokumentów, z których pochodzą pozostałe parametry realizacji.
   * Raport właścicielski pokazuje je przy każdej liczbie, więc muszą być
   * danymi szarży, a nie zmyślane w warstwie widoku.
   */
  setterReportNumber?: string;
  faultReportNumber?: string;
  moldServiceDocNumber?: string;
  purchaseInvoiceNumber?: string;
  /**
   * Pełny zestaw parametrów kosztowych. Szarże bez tego pola nie trafiają do
   * raportu właścicielskiego — nie mają czym uzasadnić kolumny „zrealizowany".
   */
  costParameters?: BatchCostParameters;
}

/** Parametry planowane szarży — baza porównania w raporcie właścicielskim. */
export interface BatchPlannedCost {
  qGood: number;
  scrapPct: number;
  cycleTimeS: number;
  setupH: number;
  packagingZlPerPiece: number;
}

/** Parametry zrealizowane szarży — jedyne źródło kolumny „zrealizowany". */
export interface BatchRealizedCost {
  qGood: number;
  scrapPct: number;
  cycleTimeS: number;
  setupH: number;
  packagingZlPerPiece: number;
  downtimeH: number;
  downtimeReason?: string;
  /** Ten sam powód po angielsku — wchodzi wprost w etykietę nośnika. */
  downtimeReasonEn?: string;
  formExtraWearCycles: number;
  formServiceCostZl: number;
  materialPriceOverrides?: Record<string, number>;
}

export interface BatchCostParameters {
  planned: BatchPlannedCost;
  realized: BatchRealizedCost;
}

/** Sześć składników TKW wg definicji klienta, w stałej kolejności. */
export type TkwComponentId =
  | "materialy"
  | "robocizna"
  | "maszyny"
  | "przygotowanie"
  | "inne_bezposrednie"
  | "posrednie";

export interface TkwComponent {
  id: TkwComponentId;
  label: string;
  /** zł na jedną sztukę dobrą. */
  planned: number;
  realized: number;
  variance: number;
  variancePct: number | null;
}

/**
 * Pojedynczy nośnik odchylenia z rozkładu sekwencyjnej substytucji.
 * `perComponent` jest indeksowane tak samo jak tablica składników, dzięki czemu
 * suma nośników domyka odchylenie każdego składnika z definicji, bez reszty.
 */
export interface TkwDriver {
  id: string;
  label: string;
  perComponent: number[];
  total: number;
}

/**
 * Wielkości pośrednie, z których policzono jedną stronę raportu (plan albo
 * realizację). Raport właścicielski pokazuje na ich podstawie pełne działanie
 * przy każdym składniku — liczby w opisie są dokładnie tymi, które weszły do
 * wzoru, więc opis nie może rozjechać się z wynikiem.
 */
export interface TkwBasis {
  qGood: number;
  scrapPct: number;
  /** Sztuki przerobione łącznie, żeby uzyskać `qGood` sztuk dobrych. */
  totalPieces: number;
  shots: number;
  cycleTimeS: number;
  runH: number;
  downtimeH: number;
  /** Godziny zajętości maszyny: praca + przestój. */
  occupiedH: number;
  setupH: number;
  recipePriceZlKg: number;
  colorantPriceZlKg: number;
  materialPerPieceZl: number;
  packagingZlPerPiece: number;
  formExtraWearCycles: number;
  formServiceCostZl: number;
}

/** Stawki i dane wyrobu użyte po obu stronach porównania. */
export interface TkwRates {
  machineId: string;
  machineName: string;
  cavities: number;
  grossWeightKg: number;
  colorantDosagePct: number;
  colorantSymbol: string;
  machineRateZlH: number;
  laborRateZlH: number;
  overheadRateZlH: number;
  setupRateZlH: number;
  moldCostPerCycleZl: number;
  moldReplacementCostZl?: number;
  moldLifetimeCycles?: number;
}

export interface TkwReport {
  batch: ProductionBatch;
  product: Product;
  components: TkwComponent[];
  drivers: TkwDriver[];
  plannedBasis: TkwBasis;
  realizedBasis: TkwBasis;
  rates: TkwRates;
  plannedUnitCost: number;
  realizedUnitCost: number;
  variance: number;
  variancePct: number;
  status: OrderStatus;
  /** Koszt techniczny wg modułu 1 — mostek do liczby 0,8406 zł ze scenariusza. */
  technicalUnitCost: number;
  moldDataMissing: boolean;
}

export interface TechnologyParameter {
  label: string;
  value: number | string;
  unit?: string;
}

export interface TechnologyCardVersion {
  version: number;
  validFrom: string;
  author: string;
  status: "archiwalna" | "zatwierdzona";
  changeReason: string;
  parameters: TechnologyParameter[];
  notes: string[];
}

export interface TechnologyCard {
  id: string;
  productId: string;
  machineId: string;
  moldId: string;
  versions: TechnologyCardVersion[];
}

export interface PackagingDefinition {
  id: string;
  name: string;
  type: "karton" | "worek" | "paleta" | "przekladka";
  dimensionsMm: [number, number, number];
  tareWeightKg: number;
}

export interface LogisticsCard {
  id: string;
  productId: string;
  packagingId: string;
  unitsPerPackage: number;
  packagesPerLayer: number;
  layersPerPallet: number;
  palletPackagingId: string;
  maxPalletHeightMm: number;
  additionalOperations: string[];
}

export interface CustomerOrderLine {
  productId: string;
  color: string;
  quantity: number;
  unitPriceZl: number;
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  orderDate: string;
  requiredDate: string;
  shippingAddressId: string;
  status: "przyjete" | "przekazane_do_produkcji" | "zrealizowane";
  lines: CustomerOrderLine[];
  document: DocumentMeta;
}

export interface ProductionOrderColorLine {
  color: string;
  orderedQty: number;
  goodQty: number;
  badQty: number;
}

export interface ProductionOrderDetails {
  orderId: string;
  customerOrderId: string;
  customerId: string;
  moldId: string;
  technologyCardId: string;
  logisticsCardId: string;
  status: "planowane" | "realizowane" | "zakonczone" | "zatwierdzone";
  colorLines: ProductionOrderColorLine[];
  document: DocumentMeta;
}

export interface ShiftReportDocument {
  document: DocumentMeta;
  operator: string;
  machineId: string;
  moldId: string;
  goodQty: number;
  badQty: number;
  actualCycleTimeS: number;
  setupTimeH: number;
  downtimeMinutes: number;
  notes: string;
}

export interface SetterReport {
  document: DocumentMeta;
  setter: string;
  machineId: string;
  moldId: string;
  setupStartedAt: string;
  setupFinishedAt: string;
  processNotes: string[];
}

export interface ProductionPlanEntry {
  id: string;
  productionOrderId?: string;
  machineId: string;
  moldId?: string;
  label: string;
  start: string;
  end: string;
  setupTimeH: number;
  status: "planowane" | "realizowane" | "zagrozone" | "zakonczone" | "rezerwacja";
  estimated: boolean;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  itemType: "material" | "packaging";
  quantity: number;
  reservedQuantity: number;
  minimumQuantity: number;
  unit: "kg" | "szt.";
  location: string;
}

export interface MaterialRequirementLine {
  itemId: string;
  requiredQuantity: number;
  reservedQuantity: number;
  toOrderQuantity: number;
  unit: "kg" | "szt.";
}

export interface MaterialRequirement {
  id: string;
  productionOrderId: string;
  createdAt: string;
  status: "utworzone" | "czesciowo_zarezerwowane" | "zarezerwowane";
  lines: MaterialRequirementLine[];
  document: DocumentMeta;
}

export interface PurchaseInvoiceLine {
  materialId: string;
  quantityKg: number;
  previousPriceZlKg: number;
  priceZlKg: number;
}

export interface PurchaseInvoice {
  id: string;
  supplier: string;
  date: string;
  status: "wprowadzona" | "zatwierdzona";
  lines: PurchaseInvoiceLine[];
  document: DocumentMeta;
}
