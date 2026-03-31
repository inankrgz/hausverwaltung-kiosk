"use client";

import { motion } from "framer-motion";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export default function BackButton({ onClick, label = "Zurück" }: BackButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl
        bg-white/10 backdrop-blur-md border border-white/20 text-white/80
        hover:bg-white/20 hover:text-white transition-all duration-200
        text-base font-medium"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      {label}
    </motion.button>
  );
}
