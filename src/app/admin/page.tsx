"use client";

import { useState, useEffect, useCallback } from "react";
import { KATEGORIE_LABELS } from "@/lib/types";
import type { Kategorie } from "@/lib/types";

interface Stoerung {
  id: string;
  titel: string;
  beschreibung: string;
  kategorie: string;
  hausnummer: string;
  bereich: string | null;
  keywords: string[];
  status: string;
  erkannt_am: string;
}

interface Ticket {
  id: string;
  vorname: string;
  nachname: string;
  hausnummer: string;
  bereich: string;
  stockwerk: string | null;
  lage: string | null;
  kategorie: string;
  beschreibung: string;
  dringlichkeit: string;
  quelle: string;
  status: string;
  erstellt_am: string;
}

type Tab = "stoerungen" | "tickets";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("stoerungen");
  const [stoerungen, setStoerungen] = useState<Stoerung[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [kategorie, setKategorie] = useState<Kategorie | "">("");
  const [hausnummer, setHausnummer] = useState<"59" | "64" | "beide">("beide");
  const [bereich, setBereich] = useState("");
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState<"aktiv" | "in_bearbeitung" | "behoben">("aktiv");

  const loadStoerungen = useCallback(async () => {
    try {
      const res = await fetch("/api/stoerungen");
      if (res.ok) setStoerungen(await res.json());
    } catch { /* ignore */ }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) setTickets(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    Promise.all([loadStoerungen(), loadTickets()]).finally(() => setLoading(false));
  }, [loadStoerungen, loadTickets]);

  const resetForm = () => {
    setTitel("");
    setBeschreibung("");
    setKategorie("");
    setHausnummer("beide");
    setBereich("");
    setKeywords("");
    setStatus("aktiv");
    setEditId(null);
    setShowForm(false);
  };

  const editStoerung = (s: Stoerung) => {
    setTitel(s.titel);
    setBeschreibung(s.beschreibung);
    setKategorie(s.kategorie as Kategorie);
    setHausnummer(s.hausnummer as "59" | "64" | "beide");
    setBereich(s.bereich || "");
    setKeywords(s.keywords.join(", "));
    setStatus(s.status as "aktiv" | "in_bearbeitung" | "behoben");
    setEditId(s.id);
    setShowForm(true);
  };

  const saveStoerung = async () => {
    if (!titel || !beschreibung || !kategorie) return;

    const payload = {
      ...(editId ? { id: editId } : {}),
      titel,
      beschreibung,
      kategorie,
      hausnummer,
      bereich: bereich || null,
      keywords: keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean),
      status,
    };

    const method = editId ? "PATCH" : "POST";
    await fetch("/api/stoerungen", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    resetForm();
    loadStoerungen();
  };

  const deleteStoerung = async (id: string) => {
    if (!confirm("Störung wirklich löschen?")) return;
    await fetch(`/api/stoerungen?id=${id}`, { method: "DELETE" });
    loadStoerungen();
  };

  const statusColor = (s: string) => {
    if (s === "aktiv") return "bg-red-500/20 text-red-300 border-red-400/40";
    if (s === "in_bearbeitung") return "bg-amber-500/20 text-amber-300 border-amber-400/40";
    if (s === "behoben") return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40";
    return "bg-white/10 text-white/60 border-white/20";
  };

  const dringlichkeitColor = (d: string) => {
    if (d === "notfall") return "bg-red-500/20 text-red-300";
    if (d === "dringend") return "bg-orange-500/20 text-orange-300";
    if (d === "normal") return "bg-blue-500/20 text-blue-300";
    return "bg-white/10 text-white/50";
  };

  const input = "w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm";
  const select = `${input} appearance-none cursor-pointer`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-white/40 hover:text-white/70 transition-colors text-sm">
              &larr; Kiosk
            </a>
            <div className="w-px h-5 bg-white/10" />
            <h1 className="text-lg font-semibold">Admin-Panel</h1>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setTab("stoerungen")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === "stoerungen" ? "bg-teal-500/20 text-teal-300" : "text-white/50 hover:text-white/80"}`}
            >
              Störungen
            </button>
            <button
              onClick={() => setTab("tickets")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === "tickets" ? "bg-blue-500/20 text-blue-300" : "text-white/50 hover:text-white/80"}`}
            >
              Tickets ({tickets.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-20 text-white/40">Laden...</div>
        ) : tab === "stoerungen" ? (
          <>
            {/* Störungen Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-white/70">
                {stoerungen.length} aktive Störung{stoerungen.length !== 1 ? "en" : ""}
              </h2>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="px-4 py-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30 text-sm font-medium hover:bg-teal-500/30 transition-colors"
              >
                + Neue Störung
              </button>
            </div>

            {/* Störung Form */}
            {showForm && (
              <div className="mb-6 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-4">
                  {editId ? "Störung bearbeiten" : "Neue Störung anlegen"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Titel *</label>
                    <input value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="z.B. Aufzug außer Betrieb" className={input} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Kategorie *</label>
                    <select value={kategorie} onChange={(e) => setKategorie(e.target.value as Kategorie)} className={select}>
                      <option value="" className="bg-slate-900">Auswählen</option>
                      {Object.entries(KATEGORIE_LABELS).map(([k, l]) => (
                        <option key={k} value={k} className="bg-slate-900">{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-white/50 mb-1">Beschreibung *</label>
                    <textarea value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)} rows={2} placeholder="Was passiert? Was wird getan?" className={`${input} resize-none`} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Hausnummer</label>
                    <select value={hausnummer} onChange={(e) => setHausnummer(e.target.value as "59" | "64" | "beide")} className={select}>
                      <option value="beide" className="bg-slate-900">Beide Häuser</option>
                      <option value="59" className="bg-slate-900">Wiesenstraße 59</option>
                      <option value="64" className="bg-slate-900">Wiesenstraße 64</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as "aktiv" | "in_bearbeitung" | "behoben")} className={select}>
                      <option value="aktiv" className="bg-slate-900">Aktiv</option>
                      <option value="in_bearbeitung" className="bg-slate-900">In Bearbeitung</option>
                      <option value="behoben" className="bg-slate-900">Behoben</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Bereich (optional)</label>
                    <input value={bereich} onChange={(e) => setBereich(e.target.value)} placeholder="z.B. Aufzug, Treppenhaus" className={input} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Keywords (kommagetrennt)</label>
                    <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="aufzug, lift, fahrstuhl" className={input} />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={saveStoerung} className="px-5 py-2 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-400 transition-colors">
                    {editId ? "Speichern" : "Erstellen"}
                  </button>
                  <button onClick={resetForm} className="px-5 py-2 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/15 transition-colors">
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {/* Störungen Liste */}
            {stoerungen.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p className="text-lg mb-2">Keine aktiven Störungen</p>
                <p className="text-sm">Erstellen Sie eine neue Störung, wenn ein bekanntes Problem vorliegt.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stoerungen.map((s) => (
                  <div key={s.id} className="rounded-xl bg-white/[0.03] border border-white/10 p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white/90">{s.titel}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(s.status)}`}>
                          {s.status === "aktiv" ? "Aktiv" : s.status === "in_bearbeitung" ? "In Bearbeitung" : "Behoben"}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm mb-1.5">{s.beschreibung}</p>
                      <div className="flex gap-3 text-xs text-white/30">
                        <span>Haus: {s.hausnummer === "beide" ? "59 & 64" : s.hausnummer}</span>
                        <span>Kategorie: {KATEGORIE_LABELS[s.kategorie as Kategorie] || s.kategorie}</span>
                        {s.keywords.length > 0 && <span>Keywords: {s.keywords.join(", ")}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => editStoerung(s)} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors">
                        Bearbeiten
                      </button>
                      <button onClick={() => deleteStoerung(s.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400/60 text-xs hover:bg-red-500/20 transition-colors">
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Tickets */}
            <h2 className="text-base font-medium text-white/70 mb-5">
              {tickets.length} Ticket{tickets.length !== 1 ? "s" : ""}
            </h2>
            {tickets.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p className="text-lg mb-2">Noch keine Tickets</p>
                <p className="text-sm">Tickets werden hier angezeigt, sobald Mieter Anliegen melden.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs font-mono text-white/30">{t.id}</span>
                        <h3 className="text-sm font-semibold text-white/90">
                          {t.vorname} {t.nachname} &middot; Wiesenstr. {t.hausnummer}
                        </h3>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dringlichkeitColor(t.dringlichkeit)}`}>
                          {t.dringlichkeit}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/40">
                          {t.quelle}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/50 text-sm mb-2">{t.beschreibung}</p>
                    <div className="flex gap-3 text-xs text-white/30">
                      <span>{KATEGORIE_LABELS[t.kategorie as Kategorie] || t.kategorie}</span>
                      <span>{t.bereich}{t.stockwerk ? ` / ${t.stockwerk}` : ""}{t.lage ? ` ${t.lage}` : ""}</span>
                      <span>{new Date(t.erstellt_am).toLocaleString("de-DE")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
