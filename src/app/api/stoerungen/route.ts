import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Alle aktiven Störungen laden
export async function GET() {
  const { data, error } = await supabase
    .from("stoerungen")
    .select("*")
    .in("status", ["aktiv", "in_bearbeitung"])
    .order("erkannt_am", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: Neue Störung erstellen
export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = `ST-${Date.now().toString(36).toUpperCase()}`;

  const { data, error } = await supabase
    .from("stoerungen")
    .insert({
      id,
      titel: body.titel,
      beschreibung: body.beschreibung,
      kategorie: body.kategorie,
      hausnummer: body.hausnummer,
      bereich: body.bereich || null,
      keywords: body.keywords || [],
      status: body.status || "aktiv",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PATCH: Störung aktualisieren
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("stoerungen")
    .update({ ...updates, aktualisiert_am: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE: Störung löschen
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
  }

  const { error } = await supabase.from("stoerungen").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
