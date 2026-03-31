import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Alle Tickets laden (für Admin)
export async function GET() {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("erstellt_am", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: Neues Ticket erstellen
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      id: body.id,
      vorname: body.vorname,
      nachname: body.nachname,
      hausnummer: body.hausnummer,
      bereich: body.bereich,
      stockwerk: body.stockwerk || null,
      lage: body.lage || null,
      gewerbe_name: body.gewerbeName || null,
      gemeinschaftsbereich: body.gemeinschaftsbereich || null,
      gemeinschaft_etage: body.gemeinschaftEtage || null,
      stellplatznummer: body.stellplatznummer || null,
      kategorie: body.kategorie,
      beschreibung: body.beschreibung,
      dringlichkeit: body.dringlichkeit,
      rueckrufnummer: body.rueckrufnummer || null,
      quelle: body.quelle || "formular",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
