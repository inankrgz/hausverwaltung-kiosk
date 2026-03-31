"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "./BackButton";
import {
  Ticket,
  Kategorie,
  Dringlichkeit,
  Hausnummer,
  Stockwerk,
  Lage,
  Bereich,
  KATEGORIE_LABELS,
  DRINGLICHKEIT_LABELS,
  BEREICH_LABELS,
  GEMEINSCHAFTSBEREICH_OPTIONS,
} from "@/lib/types";
import { submitTicket, generateTicketId } from "@/lib/api";
import { findMatchingStoerung, type Stoerung } from "@/lib/stoerungen";

interface TicketFormProps {
  onClose: () => void;
}

export default function TicketForm({ onClose }: TicketFormProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [matchedStoerung, setMatchedStoerung] = useState<Stoerung | null>(null);

  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [hausnummer, setHausnummer] = useState<Hausnummer | "">("");
  const [bereich, setBereich] = useState<Bereich | "">("");
  const [stockwerk, setStockwerk] = useState<Stockwerk | "">("");
  const [lage, setLage] = useState<Lage | "">("");
  const [gewerbeName, setGewerbeName] = useState("");
  const [gemeinschaftsbereich, setGemeinschaftsbereich] = useState("");
  const [gemeinschaftEtage, setGemeinschaftEtage] = useState("");
  const [stellplatznummer, setStellplatznummer] = useState("");
  const [kategorie, setKategorie] = useState<Kategorie | "">("");
  const [beschreibung, setBeschreibung] = useState("");
  const [dringlichkeit, setDringlichkeit] = useState<Dringlichkeit>("normal");
  const [rueckrufnummer, setRueckrufnummer] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!vorname.trim()) newErrors.vorname = "Bitte Vornamen eingeben";
    if (!nachname.trim()) newErrors.nachname = "Bitte Nachnamen eingeben";
    if (!hausnummer) newErrors.hausnummer = "Bitte Hausnummer auswählen";
    if (!bereich) newErrors.bereich = "Bitte Bereich auswählen";

    if (bereich === "wohnung") {
      if (!stockwerk) newErrors.stockwerk = "Bitte Stockwerk auswählen";
      if (!lage) newErrors.lage = "Bitte Lage auswählen";
    }
    if (bereich === "gewerbe" && !gewerbeName.trim()) {
      newErrors.gewerbeName = "Bitte Gewerbeeinheit angeben";
    }
    if (bereich === "gemeinschaft" && !gemeinschaftsbereich) {
      newErrors.gemeinschaftsbereich = "Bitte Bereich auswählen";
    }
    if (bereich === "stellplatz" && !stellplatznummer.trim()) {
      newErrors.stellplatznummer = "Bitte Stellplatznummer angeben";
    }

    if (!kategorie) newErrors.kategorie = "Bitte Kategorie auswählen";
    if (!beschreibung.trim())
      newErrors.beschreibung = "Bitte beschreiben Sie Ihr Anliegen";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Störungsabgleich bei Kategorie/Hausnummer/Beschreibungs-Änderung
  const checkStoerung = () => {
    if (kategorie && hausnummer && beschreibung.trim()) {
      const match = findMatchingStoerung(beschreibung, kategorie as Kategorie, hausnummer as Hausnummer);
      setMatchedStoerung(match);
    } else {
      setMatchedStoerung(null);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Störung nochmal prüfen
    if (kategorie && hausnummer) {
      const match = findMatchingStoerung(beschreibung, kategorie as Kategorie, hausnummer as Hausnummer);
      setMatchedStoerung(match);
    }

    setSubmitting(true);
    const id = generateTicketId();

    const ticket: Ticket = {
      id,
      vorname: vorname.trim(),
      nachname: nachname.trim(),
      hausnummer: hausnummer as Hausnummer,
      bereich: bereich as Bereich,
      ...(bereich === "wohnung" && {
        stockwerk: stockwerk as Stockwerk,
        lage: lage as Lage,
      }),
      ...(bereich === "gewerbe" && { gewerbeName: gewerbeName.trim() }),
      ...(bereich === "gemeinschaft" && {
        gemeinschaftsbereich,
        gemeinschaftEtage: gemeinschaftEtage.trim() || undefined,
      }),
      ...(bereich === "stellplatz" && {
        stellplatznummer: stellplatznummer.trim(),
      }),
      kategorie: kategorie as Kategorie,
      beschreibung: beschreibung.trim(),
      dringlichkeit,
      rueckrufnummer: rueckrufnummer.trim() || undefined,
      erstelltAm: new Date().toISOString(),
      quelle: "formular",
    };

    await submitTicket(ticket);
    setTicketId(id);
    setStep("success");
    setSubmitting(false);

    setTimeout(() => onClose(), 10000);
  };

  if (step === "success") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/30 border-2 border-emerald-400/50 flex items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Ticket erstellt
          </h2>
          <p className="text-white/60 text-lg mb-2">
            Ihre Ticket-Nummer:{" "}
            <span className="text-emerald-400 font-mono font-semibold">
              {ticketId}
            </span>
          </p>
          <p className="text-white/50 text-base">
            Die Hausverwaltung wird sich innerhalb der nächsten Tage bei Ihnen
            melden.
          </p>
          <motion.button
            onClick={onClose}
            className="mt-8 px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80
              backdrop-blur-md border border-white/20 transition-colors text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Zurück zum Startbildschirm
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-white/30
    focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-base
    ${errors[field] ? "border-red-400/60" : "border-white/15"}`;

  const selectClass = (field: string) =>
    `w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white
    focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-base
    appearance-none cursor-pointer
    ${errors[field] ? "border-red-400/60" : "border-white/15"}`;

  const ErrorMsg = ({ field }: { field: string }) => (
    <AnimatePresence>
      {errors[field] && (
        <motion.p
          className="text-red-400 text-sm mt-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {errors[field]}
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <BackButton onClick={onClose} />

      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Ticket erstellen
          </h2>
          <p className="text-white/50">
            Bitte füllen Sie das Formular aus, um Ihr Anliegen zu melden.
          </p>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Vorname *
              </label>
              <input
                type="text"
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
                placeholder="Vorname"
                className={inputClass("vorname")}
              />
              <ErrorMsg field="vorname" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Nachname *
              </label>
              <input
                type="text"
                value={nachname}
                onChange={(e) => setNachname(e.target.value)}
                placeholder="Nachname"
                className={inputClass("nachname")}
              />
              <ErrorMsg field="nachname" />
            </div>
          </div>

          {/* Hausnummer */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Hausnummer *
            </label>
            <select
              value={hausnummer}
              onChange={(e) => setHausnummer(e.target.value as Hausnummer)}
              className={selectClass("hausnummer")}
            >
              <option value="" className="bg-slate-900">
                Bitte auswählen
              </option>
              <option value="59" className="bg-slate-900">
                Wiesenstraße 59
              </option>
              <option value="64" className="bg-slate-900">
                Wiesenstraße 64
              </option>
            </select>
            <ErrorMsg field="hausnummer" />
          </div>

          {/* Bereich */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Was betrifft Ihr Anliegen? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(BEREICH_LABELS) as [Bereich, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setBereich(key);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.bereich;
                        return next;
                      });
                    }}
                    className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                      bereich === key
                        ? "bg-teal-500/20 border-teal-400/50 text-teal-300"
                        : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
            <ErrorMsg field="bereich" />
          </div>

          {/* Kontextabhängige Felder */}
          <AnimatePresence mode="wait">
            {bereich === "wohnung" && (
              <motion.div
                key="wohnung"
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">
                    Stockwerk *
                  </label>
                  <select
                    value={stockwerk}
                    onChange={(e) =>
                      setStockwerk(e.target.value as Stockwerk)
                    }
                    className={selectClass("stockwerk")}
                  >
                    <option value="" className="bg-slate-900">
                      Bitte auswählen
                    </option>
                    <option value="EG" className="bg-slate-900">
                      Erdgeschoss
                    </option>
                    <option value="1. OG" className="bg-slate-900">
                      1. Obergeschoss
                    </option>
                    <option value="2. OG" className="bg-slate-900">
                      2. Obergeschoss
                    </option>
                    <option value="3. OG" className="bg-slate-900">
                      3. Obergeschoss
                    </option>
                    <option value="4. OG" className="bg-slate-900">
                      4. Obergeschoss
                    </option>
                  </select>
                  <ErrorMsg field="stockwerk" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">
                    Lage der Wohnung *
                  </label>
                  <select
                    value={lage}
                    onChange={(e) => setLage(e.target.value as Lage)}
                    className={selectClass("lage")}
                  >
                    <option value="" className="bg-slate-900">
                      Bitte auswählen
                    </option>
                    <option value="links" className="bg-slate-900">
                      Links
                    </option>
                    <option value="mitte" className="bg-slate-900">
                      Mitte
                    </option>
                    <option value="rechts" className="bg-slate-900">
                      Rechts
                    </option>
                  </select>
                  <ErrorMsg field="lage" />
                </div>
              </motion.div>
            )}

            {bereich === "gewerbe" && (
              <motion.div
                key="gewerbe"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm text-white/60 mb-1.5">
                  Name der Gewerbeeinheit *
                </label>
                <input
                  type="text"
                  value={gewerbeName}
                  onChange={(e) => setGewerbeName(e.target.value)}
                  placeholder="z.B. Bäckerei Müller, Praxis Dr. Schmidt..."
                  className={inputClass("gewerbeName")}
                />
                <ErrorMsg field="gewerbeName" />
              </motion.div>
            )}

            {bereich === "gemeinschaft" && (
              <motion.div
                key="gemeinschaft"
                className="space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">
                    Welcher Bereich? *
                  </label>
                  <select
                    value={gemeinschaftsbereich}
                    onChange={(e) =>
                      setGemeinschaftsbereich(e.target.value)
                    }
                    className={selectClass("gemeinschaftsbereich")}
                  >
                    <option value="" className="bg-slate-900">
                      Bitte auswählen
                    </option>
                    {GEMEINSCHAFTSBEREICH_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ErrorMsg field="gemeinschaftsbereich" />
                </div>
                {gemeinschaftsbereich === "Treppenhaus" && (
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">
                      Ungefähre Etage (optional)
                    </label>
                    <input
                      type="text"
                      value={gemeinschaftEtage}
                      onChange={(e) => setGemeinschaftEtage(e.target.value)}
                      placeholder="z.B. zwischen 2. und 3. OG"
                      className={inputClass("gemeinschaftEtage")}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {bereich === "stellplatz" && (
              <motion.div
                key="stellplatz"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm text-white/60 mb-1.5">
                  Stellplatznummer *
                </label>
                <input
                  type="text"
                  value={stellplatznummer}
                  onChange={(e) => setStellplatznummer(e.target.value)}
                  placeholder="z.B. 12, P-03..."
                  className={inputClass("stellplatznummer")}
                />
                <ErrorMsg field="stellplatznummer" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Kategorie */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Kategorie *
            </label>
            <select
              value={kategorie}
              onChange={(e) => setKategorie(e.target.value as Kategorie)}
              className={selectClass("kategorie")}
            >
              <option value="" className="bg-slate-900">
                Bitte auswählen
              </option>
              {Object.entries(KATEGORIE_LABELS).map(([key, label]) => (
                <option key={key} value={key} className="bg-slate-900">
                  {label}
                </option>
              ))}
            </select>
            <ErrorMsg field="kategorie" />
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Beschreibung Ihres Anliegens *
            </label>
            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              onBlur={checkStoerung}
              placeholder="Bitte beschreiben Sie Ihr Anliegen möglichst genau..."
              rows={4}
              className={`${inputClass("beschreibung")} resize-none`}
            />
            <ErrorMsg field="beschreibung" />
          </div>

          {/* Dringlichkeit */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Dringlichkeit
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                Object.entries(DRINGLICHKEIT_LABELS) as [
                  Dringlichkeit,
                  string,
                ][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDringlichkeit(key)}
                  className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                    dringlichkeit === key
                      ? key === "notfall"
                        ? "bg-red-500/20 border-red-400/50 text-red-300"
                        : key === "dringend"
                          ? "bg-orange-500/20 border-orange-400/50 text-orange-300"
                          : "bg-teal-500/20 border-teal-400/50 text-teal-300"
                      : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Rückrufnummer */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Rückrufnummer (optional)
            </label>
            <input
              type="tel"
              value={rueckrufnummer}
              onChange={(e) => setRueckrufnummer(e.target.value)}
              placeholder="Telefonnummer für Rückruf"
              className={inputClass("rueckrufnummer")}
            />
          </div>

          {/* Störungshinweis */}
          <AnimatePresence>
            {matchedStoerung && (
              <motion.div
                className="rounded-2xl bg-amber-500/10 border border-amber-400/30 p-5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 mt-0.5 shrink-0">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
                  </svg>
                  <div>
                    <p className="text-amber-300 text-sm font-semibold mb-1">
                      Bekannte Störung: {matchedStoerung.titel}
                    </p>
                    <p className="text-white/50 text-sm">
                      {matchedStoerung.beschreibung}
                    </p>
                    <p className="text-white/40 text-xs mt-2">
                      Sie können Ihr Ticket trotzdem absenden, damit wir wissen, dass Sie betroffen sind.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500
              text-white text-lg font-semibold hover:from-teal-400 hover:to-blue-400
              disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
          >
            {submitting ? "Wird gesendet..." : "Ticket absenden"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
