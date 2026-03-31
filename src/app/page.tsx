"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import MainMenu from "@/components/MainMenu";
import VoiceAssistant from "@/components/VoiceAssistant";
import TicketForm from "@/components/TicketForm";
import QRCodeDisplay from "@/components/QRCodeDisplay";

type View = "menu" | "voice" | "ticket" | "qr";

export default function Home() {
  const [view, setView] = useState<View>("menu");

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {view === "menu" && (
          <MainMenu
            key="menu"
            onVoice={() => setView("voice")}
            onTicket={() => setView("ticket")}
            onQR={() => setView("qr")}
          />
        )}
        {view === "voice" && (
          <VoiceAssistant key="voice" onClose={() => setView("menu")} />
        )}
        {view === "ticket" && (
          <TicketForm key="ticket" onClose={() => setView("menu")} />
        )}
        {view === "qr" && (
          <QRCodeDisplay key="qr" onClose={() => setView("menu")} />
        )}
      </AnimatePresence>
    </div>
  );
}
