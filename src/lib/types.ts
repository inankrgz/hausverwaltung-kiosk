export type Kategorie =
  | "wasserschaden"
  | "heizung"
  | "sanitaer"
  | "elektrik"
  | "fenster_tueren"
  | "schimmel"
  | "laerm"
  | "schaedlinge"
  | "gemeinschaftsbereich"
  | "stellplatz"
  | "schluessel"
  | "verwaltung"
  | "sonstiges";

export type Dringlichkeit = "niedrig" | "normal" | "dringend" | "notfall";

export type Hausnummer = "59" | "64";

export type Stockwerk = "EG" | "1. OG" | "2. OG" | "3. OG" | "4. OG";

export type Lage = "links" | "mitte" | "rechts";

export type Bereich = "wohnung" | "gewerbe" | "gemeinschaft" | "stellplatz";

export interface Ticket {
  id: string;
  vorname: string;
  nachname: string;
  hausnummer: Hausnummer;
  bereich: Bereich;
  // Wohnung
  stockwerk?: Stockwerk;
  lage?: Lage;
  // Gewerbe
  gewerbeName?: string;
  // Gemeinschaftsbereich
  gemeinschaftsbereich?: string;
  gemeinschaftEtage?: string;
  // Stellplatz
  stellplatznummer?: string;
  // Allgemein
  kategorie: Kategorie;
  beschreibung: string;
  dringlichkeit: Dringlichkeit;
  rueckrufnummer?: string;
  foto?: string;
  erstelltAm: string;
  quelle: "formular" | "sprachassistent" | "qr-code";
}

export const BEREICH_LABELS: Record<Bereich, string> = {
  wohnung: "Wohnung",
  gewerbe: "Gewerbeeinheit",
  gemeinschaft: "Gemeinschaftsbereich",
  stellplatz: "Stellplatz / Parkplatz",
};

export const KATEGORIE_LABELS: Record<Kategorie, string> = {
  wasserschaden: "Wasserschaden",
  heizung: "Heizung / Warmwasser",
  sanitaer: "Sanitär (Bad, WC, Abfluss)",
  elektrik: "Elektrik (Strom, Licht, Klingel)",
  fenster_tueren: "Fenster & Türen",
  schimmel: "Schimmel",
  laerm: "Lärm / Nachbarschaft",
  schaedlinge: "Schädlinge / Ungeziefer",
  gemeinschaftsbereich: "Gemeinschaftsbereich",
  stellplatz: "Stellplatz / Parkplatz",
  schluessel: "Schlüssel / Schloss",
  verwaltung: "Verwaltung (Vertrag, Abrechnung)",
  sonstiges: "Sonstiges",
};

export const DRINGLICHKEIT_LABELS: Record<Dringlichkeit, string> = {
  niedrig: "Niedrig - kann geplant werden",
  normal: "Normal - innerhalb einer Woche",
  dringend: "Dringend - innerhalb 24 Stunden",
  notfall: "Notfall - sofortige Gefahr",
};

export const GEMEINSCHAFTSBEREICH_OPTIONS = [
  "Treppenhaus",
  "Keller",
  "Innenhof",
  "Waschküche",
  "Müllraum",
  "Flur / Eingangsbereich",
  "Briefkastenanlage",
  "Aufzug",
  "Sonstiges",
];
