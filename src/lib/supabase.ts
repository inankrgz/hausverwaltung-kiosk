import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase Database Schema - run this SQL in the Supabase SQL Editor:
 *
 * -- Tickets Tabelle
 * CREATE TABLE tickets (
 *   id TEXT PRIMARY KEY,
 *   vorname TEXT NOT NULL,
 *   nachname TEXT NOT NULL,
 *   hausnummer TEXT NOT NULL CHECK (hausnummer IN ('59', '64')),
 *   bereich TEXT NOT NULL CHECK (bereich IN ('wohnung', 'gewerbe', 'gemeinschaft', 'stellplatz')),
 *   stockwerk TEXT,
 *   lage TEXT,
 *   gewerbe_name TEXT,
 *   gemeinschaftsbereich TEXT,
 *   gemeinschaft_etage TEXT,
 *   stellplatznummer TEXT,
 *   kategorie TEXT NOT NULL,
 *   beschreibung TEXT NOT NULL,
 *   dringlichkeit TEXT NOT NULL DEFAULT 'normal',
 *   rueckrufnummer TEXT,
 *   quelle TEXT NOT NULL DEFAULT 'formular',
 *   status TEXT NOT NULL DEFAULT 'offen',
 *   erstellt_am TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   aktualisiert_am TIMESTAMPTZ NOT NULL DEFAULT NOW()
 * );
 *
 * -- Störungen Tabelle
 * CREATE TABLE stoerungen (
 *   id TEXT PRIMARY KEY,
 *   titel TEXT NOT NULL,
 *   beschreibung TEXT NOT NULL,
 *   kategorie TEXT NOT NULL,
 *   hausnummer TEXT NOT NULL CHECK (hausnummer IN ('59', '64', 'beide')),
 *   bereich TEXT,
 *   keywords TEXT[] NOT NULL DEFAULT '{}',
 *   status TEXT NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'in_bearbeitung', 'behoben')),
 *   erkannt_am TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   aktualisiert_am TIMESTAMPTZ NOT NULL DEFAULT NOW()
 * );
 *
 * -- Row Level Security aktivieren
 * ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE stoerungen ENABLE ROW LEVEL SECURITY;
 *
 * -- Öffentliche Leserechte für Störungen (Kiosk braucht das)
 * CREATE POLICY "Stoerungen sind öffentlich lesbar" ON stoerungen FOR SELECT USING (true);
 *
 * -- Öffentliche Schreibrechte für Tickets (Kiosk erstellt Tickets)
 * CREATE POLICY "Tickets können erstellt werden" ON tickets FOR INSERT WITH CHECK (true);
 *
 * -- Öffentliche Leserechte für Tickets (Admin-Panel)
 * CREATE POLICY "Tickets sind lesbar" ON tickets FOR SELECT USING (true);
 *
 * -- Störungen können verwaltet werden
 * CREATE POLICY "Stoerungen können verwaltet werden" ON stoerungen FOR ALL USING (true);
 */
