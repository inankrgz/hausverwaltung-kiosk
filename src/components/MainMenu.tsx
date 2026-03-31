"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

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
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function MainMenu({ onVoice, onTicket, onQR }: MainMenuProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-3 mb-4 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-white/70 text-sm font-medium tracking-wide uppercase">
            Hausverwaltung
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Wiesenstraße 59 & 64
        </h1>
        <p className="text-white/50 text-lg">
          Wie können wir Ihnen helfen?
        </p>
      </motion.div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
        {/* Voice Assistant Card */}
        <motion.button
          onClick={onVoice}
          className="group relative rounded-3xl p-8 text-left overflow-hidden
            bg-gradient-to-br from-white/[0.08] to-white/[0.02]
            border border-white/[0.12] backdrop-blur-xl
            hover:border-teal-400/40 hover:from-teal-500/10 hover:to-teal-500/5
            transition-colors duration-300 cursor-pointer"
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mb-5 group-hover:bg-teal-500/30 transition-colors">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal-400"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Sprachassistent
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Sprechen Sie direkt mit unserem Assistenten Arne und schildern Sie Ihr Anliegen.
          </p>
          <div className="mt-5 flex items-center gap-2 text-teal-400/80 text-sm font-medium">
            <span>Jetzt sprechen</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </div>

          {/* Pulse animation */}
          <motion.div
            className="absolute top-6 right-6 w-3 h-3 rounded-full bg-teal-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>

        {/* Ticket Form Card */}
        <motion.button
          onClick={onTicket}
          className="group relative rounded-3xl p-8 text-left overflow-hidden
            bg-gradient-to-br from-white/[0.08] to-white/[0.02]
            border border-white/[0.12] backdrop-blur-xl
            hover:border-blue-400/40 hover:from-blue-500/10 hover:to-blue-500/5
            transition-colors duration-300 cursor-pointer"
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:bg-blue-500/30 transition-colors">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-400"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Ticket erstellen
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Erstellen Sie manuell ein Ticket mit allen Informationen zu Ihrem Anliegen.
          </p>
          <div className="mt-5 flex items-center gap-2 text-blue-400/80 text-sm font-medium">
            <span>Formular öffnen</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </motion.button>

        {/* QR Code Card */}
        <motion.button
          onClick={onQR}
          className="group relative rounded-3xl p-8 text-left overflow-hidden
            bg-gradient-to-br from-white/[0.08] to-white/[0.02]
            border border-white/[0.12] backdrop-blur-xl
            hover:border-purple-400/40 hover:from-purple-500/10 hover:to-purple-500/5
            transition-colors duration-300 cursor-pointer"
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-5 group-hover:bg-purple-500/30 transition-colors">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-400"
            >
              <rect width="5" height="5" x="3" y="3" rx="1" />
              <rect width="5" height="5" x="16" y="3" rx="1" />
              <rect width="5" height="5" x="3" y="16" rx="1" />
              <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
              <path d="M21 21v.01" />
              <path d="M12 7v3a2 2 0 0 1-2 2H7" />
              <path d="M3 12h.01" />
              <path d="M12 3h.01" />
              <path d="M12 16v.01" />
              <path d="M16 12h1" />
              <path d="M21 12v.01" />
              <path d="M12 21v-1" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            QR-Code
          </h3>
          <p className="text-white/50 text-sm leading-relaxed mb-4">
            Scannen Sie den Code mit Ihrem Smartphone.
          </p>

          {/* Mini QR code always visible */}
          <div className="flex justify-center mt-2">
            <div className="p-2 rounded-xl bg-white">
              <QRCodeSVG
                value={appUrl}
                size={80}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
              />
            </div>
          </div>
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div
        className="mt-12 text-center text-white/30 text-sm relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>Hausverwaltung Wiesenstraße &middot; Mo-Fr 9:00-17:00 Uhr</p>
        <p className="mt-1">verwaltung.wiesenstr@gmx.de</p>
      </motion.div>
    </div>
  );
}
