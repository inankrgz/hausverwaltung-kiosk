import { Ticket } from "./types";
import type { Stoerung } from "./stoerungen";

/**
 * Ticket an die API senden (Supabase).
 * Fallback auf localStorage wenn API nicht verfügbar.
 */
export async function submitTicket(ticket: Ticket): Promise<{ success: boolean; id: string }> {
  try {
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket),
    });
    if (res.ok) {
      return { success: true, id: ticket.id };
    }
    // Fallback bei API-Fehler
    console.warn("API-Fehler, speichere lokal:", await res.text());
  } catch (err) {
    console.warn("API nicht erreichbar, speichere lokal:", err);
  }

  // Fallback: localStorage
  const existing = getStoredTickets();
  existing.push(ticket);
  localStorage.setItem("hausverwaltung_tickets", JSON.stringify(existing));
  return { success: true, id: ticket.id };
}

export function getStoredTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("hausverwaltung_tickets");
  return stored ? JSON.parse(stored) : [];
}

export function generateTicketId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TK-${date}-${rand}`;
}

/**
 * Aktive Störungen von der API laden.
 * Fallback auf die statische Liste.
 */
export async function fetchAktiveStoerungen(): Promise<Stoerung[]> {
  try {
    const res = await fetch("/api/stoerungen", { next: { revalidate: 60 } });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API nicht verfügbar
  }
  // Fallback: statische Liste
  const { getAktiveStoerungen } = await import("./stoerungen");
  return getAktiveStoerungen();
}
