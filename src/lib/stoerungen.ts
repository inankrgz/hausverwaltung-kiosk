import { Hausnummer, Kategorie } from "./types";

export interface Stoerung {
  id: string;
  titel: string;
  beschreibung: string;
  kategorie: Kategorie;
  hausnummer: Hausnummer | "beide";
  bereich?: string;
  erkanntAm: string;
  status: "aktiv" | "in_bearbeitung" | "behoben";
  // Matching-Keywords: wenn ein Ticket diese Wörter enthält, wird die Störung erkannt
  keywords: string[];
}

// Aktive Störungen - diese Liste wird später über ein Admin-Panel oder API gepflegt.
// Aktuell manuell bearbeitbar in dieser Datei.
const AKTIVE_STOERUNGEN: Stoerung[] = [
  // Beispiel-Störungen (auskommentiert - bei Bedarf aktivieren):
  /*
  {
    id: "ST-001",
    titel: "Aufzug außer Betrieb",
    beschreibung: "Der Aufzug in der Wiesenstraße 59 ist seit dem 28.03. außer Betrieb. Ein Techniker ist beauftragt.",
    kategorie: "gemeinschaftsbereich",
    hausnummer: "59",
    bereich: "Aufzug",
    erkanntAm: "2026-03-28T10:00:00Z",
    status: "in_bearbeitung",
    keywords: ["aufzug", "lift", "fahrstuhl"],
  },
  {
    id: "ST-002",
    titel: "Heizungsausfall Haus 64",
    beschreibung: "Die Heizungsanlage in der Wiesenstraße 64 wird aktuell repariert. Voraussichtliche Behebung bis morgen Abend.",
    kategorie: "heizung",
    hausnummer: "64",
    erkanntAm: "2026-03-30T14:00:00Z",
    status: "in_bearbeitung",
    keywords: ["heizung", "kalt", "warm", "heizkörper", "warmwasser"],
  },
  */
];

export function getAktiveStoerungen(): Stoerung[] {
  return AKTIVE_STOERUNGEN.filter((s) => s.status !== "behoben");
}

export function getStoerungFuerHaus(hausnummer: Hausnummer): Stoerung[] {
  return getAktiveStoerungen().filter(
    (s) => s.hausnummer === hausnummer || s.hausnummer === "beide"
  );
}

/**
 * Prüft ob ein neues Ticket zu einer bekannten Störung passt.
 * Gibt die passende Störung zurück oder null.
 */
export function findMatchingStoerung(
  beschreibung: string,
  kategorie: Kategorie,
  hausnummer: Hausnummer
): Stoerung | null {
  const lower = beschreibung.toLowerCase();
  const relevant = getStoerungFuerHaus(hausnummer);

  for (const stoerung of relevant) {
    // Kategorie-Match
    if (stoerung.kategorie === kategorie) {
      // Keyword-Match
      const keywordMatch = stoerung.keywords.some((kw) => lower.includes(kw));
      if (keywordMatch) return stoerung;
    }
  }
  return null;
}

/**
 * Generiert einen Text-Block für den Voice-Prompt mit aktuellen Störungen.
 */
export function getStoerungPromptBlock(): string {
  const aktive = getAktiveStoerungen();
  if (aktive.length === 0) return "";

  let block = `\n\nAKTUELL BEKANNTE STÖRUNGEN - Wenn ein Anrufer eines dieser Probleme meldet, informiere ihn PROAKTIV:\n`;
  for (const s of aktive) {
    const haus =
      s.hausnummer === "beide"
        ? "beide Häuser"
        : `Wiesenstraße ${s.hausnummer === "59" ? "neunundfünfzig" : "vierundsechzig"}`;
    block += `- ${s.titel} (${haus}): "${s.beschreibung}" - Sage dem Anrufer: "Das ist uns bereits bekannt. ${s.beschreibung}" Nimm das Anliegen trotzdem auf, aber informiere den Mieter, dass die Hausverwaltung schon dran ist.\n`;
  }
  block += `Wenn der Anrufer ein Problem meldet, das einer dieser Störungen entspricht, informiere ihn BEVOR du alle Details abfragst. Nimm das Ticket trotzdem auf.\n`;

  return block;
}
