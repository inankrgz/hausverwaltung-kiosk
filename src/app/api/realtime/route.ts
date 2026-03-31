import { NextResponse } from "next/server";
import { ARNE_SYSTEM_PROMPT } from "@/lib/prompts";
import { supabase } from "@/lib/supabase";

function buildStoerungBlock(stoerungen: { titel: string; beschreibung: string; hausnummer: string }[]): string {
  if (stoerungen.length === 0) return "";

  let block = `\n\nAKTUELL BEKANNTE STÖRUNGEN - Wenn ein Anrufer eines dieser Probleme meldet, informiere ihn PROAKTIV:\n`;
  for (const s of stoerungen) {
    const haus =
      s.hausnummer === "beide"
        ? "beide Häuser"
        : `Wiesenstraße ${s.hausnummer === "59" ? "neunundfünfzig" : "vierundsechzig"}`;
    block += `- ${s.titel} (${haus}): "${s.beschreibung}" - Sage dem Anrufer: "Das ist uns bereits bekannt. ${s.beschreibung}" Nimm das Anliegen trotzdem auf, aber informiere den Mieter, dass die Hausverwaltung schon dran ist.\n`;
  }
  block += `Wenn der Anrufer ein Problem meldet, das einer dieser Störungen entspricht, informiere ihn BEVOR du alle Details abfragst. Nimm das Ticket trotzdem auf.\n`;
  return block;
}

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  // Aktive Störungen aus DB laden
  let stoerungBlock = "";
  try {
    const { data } = await supabase
      .from("stoerungen")
      .select("titel, beschreibung, hausnummer")
      .in("status", ["aktiv", "in_bearbeitung"]);
    if (data && data.length > 0) {
      stoerungBlock = buildStoerungBlock(data);
    }
  } catch {
    // Fallback: ohne Störungen weitermachen
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "ash",
          instructions: ARNE_SYSTEM_PROMPT + stoerungBlock,
          input_audio_transcription: {
            model: "whisper-1",
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 700,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI Realtime session error:", error);
      return NextResponse.json(
        { error: "Failed to create realtime session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating realtime session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
