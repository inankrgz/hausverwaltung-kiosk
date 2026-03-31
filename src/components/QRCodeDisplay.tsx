"use client";

import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import BackButton from "./BackButton";

interface QRCodeDisplayProps {
  onClose: () => void;
}

export default function QRCodeDisplay({ onClose }: QRCodeDisplayProps) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <BackButton onClick={onClose} />

      <motion.div
        className="text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          QR-Code scannen
        </h2>
        <p className="text-white/50 text-lg mb-8 max-w-md">
          Scannen Sie diesen QR-Code mit Ihrem Smartphone, um Ihr Anliegen bequem von Ihrem Gerät zu melden.
        </p>

        <motion.div
          className="inline-block p-6 rounded-3xl bg-white shadow-2xl shadow-blue-500/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <QRCodeSVG
            value={appUrl}
            size={320}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="H"
            includeMargin={false}
          />
        </motion.div>

        <p className="text-white/40 text-sm mt-6">
          {appUrl}
        </p>
      </motion.div>
    </motion.div>
  );
}
