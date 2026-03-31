import { Ticket } from "./types";

// Placeholder API functions - ready for backend integration
// Replace these with actual API calls when the backend is available

const STORAGE_KEY = "hausverwaltung_tickets";

export async function submitTicket(ticket: Ticket): Promise<{ success: boolean; id: string }> {
  // TODO: Replace with actual API call
  // e.g., const res = await fetch('/api/tickets', { method: 'POST', body: JSON.stringify(ticket) });

  const existing = getStoredTickets();
  existing.push(ticket);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  return { success: true, id: ticket.id };
}

export function getStoredTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function generateTicketId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TK-${date}-${rand}`;
}
