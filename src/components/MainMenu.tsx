"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { getAktiveStoerungen } from "@/lib/stoerungen";
import type { Stoerung } from "@/lib/stoerungen";

interface MainMenuProps {
  onVoice: () => void;
  onTicket: () => void;
  onQR: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

function StatusBadge({ status }: { status: Stoerung["status"] }) {
  const config = {
    aktiv: { bg: "bg-red-500/20", border: "border-red-400/40", text: "text-red-300", label: "Aktiv" },
    in_bearbeitung: { bg: "bg-amber-500/20", border: "border-amber-400/40", text: "text-amber-300", label: "In Bearbeitung" },
    behoben: { bg: "bg-emerald-500/20", border: "border-emerald-400/40", text: "text-emerald-300", label: "Behoben" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.border} ${c.text} border`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "aktiv" ? "bg-red-400 animate-pulse" : status === "in_bearbeitung" ? "bg-amber-400" : "bg-emerald-400"}`} />
      {c.label}
    </span>
  );
}

function TimeDisplay() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    }
    update();
    const iv = setInterval(update, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="text-right">
      <p className="text-white/90 text-lg font-semibold tabular-nums">{time}</p>
      <p className="text-white/40 text-xs">{date}</p>
    </div>
  );
}

export default function MainMenu({ onVoice, onTicket, onQR }: MainMenuProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stoerungen = getAktiveStoerungen();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* App Status Bar */}
      <motion.div
        className="relative z-10 flex items-center justify-between px-6 pt-4 pb-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <p className="text-white/90 text-sm font-semibold">Hausverwaltung</p>
            <p className="text-white/40 text-xs">Wiesenstraße 59 & 64</p>
          </div>
        </div>
        <TimeDisplay />
      </motion.div>

      {/* Separator */}
      <div className="mx-6 h-px bg-white/5" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 relative z-10">
        {/* Störungsbanner */}
        {stoerungen.length > 0 && (
          <motion.div
            className="w-full max-w-5xl mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="rounded-2xl bg-amber-500/5 border border-amber-400/20 backdrop-blur-md px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
                <span className="text-amber-300/90 text-sm font-semibold">
                  Aktuelle Meldungen ({stoerungen.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {stoerungen.map((s) => (
                  <div key={s.id} className="flex items-start justify-between gap-3 bg-white/3 rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-medium">{s.titel}</p>
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{s.beschreibung}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Hero */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Wie können wir helfen?
          </h1>
          <p className="text-white/40 text-base">
            Wählen Sie eine Option, um Ihr Anliegen zu melden.
          </p>
        </motion.div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full">
          {/* Voice Assistant Card */}
          <motion.button
            onClick={onVoice}
            className="group relative rounded-3xl p-7 text-left overflow-hidden
              bg-gradient-to-br from-white/[0.07] to-white/[0.02]
              border border-white/[0.1] backdrop-blur-xl
              hover:border-teal-400/40 hover:from-teal-500/10 hover:to-teal-500/5
              active:scale-[0.97] transition-all duration-200 cursor-pointer"
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mb-4 group-hover:bg-teal-500/30 transition-colors">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1.5">Sprachassistent</h3>
            <p className="text-white/45 text-sm leading-relaxed">
              Sprechen Sie direkt mit Arne und schildern Sie Ihr Anliegen.
            </p>
            <div className="mt-4 flex items-center gap-2 text-teal-400/80 text-sm font-medium">
              <span>Jetzt sprechen</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </div>
            <motion.div
              className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-teal-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>

          {/* Ticket Form Card */}
          <motion.button
            onClick={onTicket}
            className="group relative rounded-3xl p-7 text-left overflow-hidden
              bg-gradient-to-br from-white/[0.07] to-white/[0.02]
              border border-white/[0.1] backdrop-blur-xl
              hover:border-blue-400/40 hover:from-blue-500/10 hover:to-blue-500/5
              active:scale-[0.97] transition-all duration-200 cursor-pointer"
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1.5">Ticket erstellen</h3>
            <p className="text-white/45 text-sm leading-relaxed">
              Erstellen Sie manuell ein Ticket mit allen Details zu Ihrem Anliegen.
            </p>
            <div className="mt-4 flex items-center gap-2 text-blue-400/80 text-sm font-medium">
              <span>Formular öffnen</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </div>
          </motion.button>

          {/* QR Code Card */}
          <motion.button
            onClick={onQR}
            className="group relative rounded-3xl p-7 text-left overflow-hidden
              bg-gradient-to-br from-white/[0.07] to-white/[0.02]
              border border-white/[0.1] backdrop-blur-xl
              hover:border-purple-400/40 hover:from-purple-500/10 hover:to-purple-500/5
              active:scale-[0.97] transition-all duration-200 cursor-pointer"
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" />
                <path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" />
                <path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1.5">QR-Code</h3>
            <p className="text-white/45 text-sm leading-relaxed mb-3">
              Mit dem Smartphone scannen.
            </p>
            <div className="flex justify-center">
              <div className="p-1.5 rounded-lg bg-white">
                <QRCodeSVG value={appUrl} size={72} bgColor="#ffffff" fgColor="#0f172a" level="M" />
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        className="relative z-10 px-6 pb-4 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="mx-auto h-px bg-white/5 mb-3" />
        <div className="flex items-center justify-between text-white/25 text-xs">
          <span>Mo-Fr 9:00-17:00 Uhr</span>
          <span>verwaltung.wiesenstr@gmx.de</span>
        </div>
      </motion.div>
    </div>
  );
}
