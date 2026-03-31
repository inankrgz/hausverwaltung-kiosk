"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "./BackButton";

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

interface VoiceAssistantProps {
  onClose: () => void;
}

export default function VoiceAssistant({ onClose }: VoiceAssistantProps) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);
  const mountedRef = useRef(true);

  // Keep onClose ref current without triggering re-renders
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  function cleanup() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (dcRef.current) {
      try { dcRef.current.close(); } catch { /* ignore */ }
    }
    if (pcRef.current) {
      try { pcRef.current.close(); } catch { /* ignore */ }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    pcRef.current = null;
    dcRef.current = null;
    streamRef.current = null;
  }

  function resetInactivityTimeout() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      cleanup();
      onCloseRef.current();
    }, 5 * 60 * 1000);
  }

  async function connect() {
    setStatus("connecting");
    setErrorMessage("");

    try {
      // 1. Get ephemeral token from our API
      const tokenRes = await fetch("/api/realtime", { method: "POST" });
      if (!mountedRef.current) return;
      if (!tokenRes.ok) {
        throw new Error("Verbindung zum Server fehlgeschlagen");
      }
      const data = await tokenRes.json();
      const ephemeralKey = data.client_secret?.value;
      if (!ephemeralKey) {
        throw new Error("Kein Session-Token erhalten");
      }

      // 2. Create peer connection
      const pc = new RTCPeerConnection();
      if (!mountedRef.current) { pc.close(); return; }
      pcRef.current = pc;

      // 3. Set up audio playback
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      // 4. Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        pc.close();
        return;
      }
      streamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 5. Set up data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === "response.audio.delta") {
            setIsSpeaking(true);
            resetInactivityTimeout();
          } else if (event.type === "response.audio.done" || event.type === "response.done") {
            setIsSpeaking(false);
          } else if (event.type === "input_audio_buffer.speech_started") {
            resetInactivityTimeout();
          }
        } catch {
          // ignore parse errors
        }
      };

      // 6. Create and set local SDP offer
      const offer = await pc.createOffer();
      if (!mountedRef.current) { pc.close(); return; }
      await pc.setLocalDescription(offer);

      // 7. Send offer to OpenAI Realtime
      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      if (!mountedRef.current) { pc.close(); return; }
      if (!sdpRes.ok) {
        throw new Error("WebRTC-Verbindung fehlgeschlagen");
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      if (!mountedRef.current) { pc.close(); return; }
      setStatus("connected");
      resetInactivityTimeout();
    } catch (err) {
      console.error("Voice connection error:", err);
      if (!mountedRef.current) return;
      setErrorMessage(
        err instanceof Error ? err.message : "Verbindungsfehler"
      );
      setStatus("error");
      cleanup();
    }
  }

  // Connect once on mount, cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const handleRetry = () => {
    cleanup();
    connect();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <BackButton onClick={handleClose} label="Beenden" />

        {/* Status text */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Sprachassistent Arne
          </h2>
          <p className="text-white/60 text-lg">
            {status === "connecting" && "Verbindung wird hergestellt..."}
            {status === "connected" &&
              !isSpeaking &&
              "Arne hört Ihnen zu..."}
            {status === "connected" && isSpeaking && "Arne spricht..."}
            {status === "error" && (errorMessage || "Verbindungsfehler")}
            {status === "idle" && "Bereit"}
          </p>
        </div>

        {/* Animated pulse */}
        <div className="relative flex items-center justify-center mb-12">
          {status === "connected" && (
            <>
              <motion.div
                className={`absolute w-48 h-48 rounded-full ${
                  isSpeaking ? "bg-teal-500/20" : "bg-blue-500/20"
                }`}
                animate={{
                  scale: isSpeaking ? [1, 1.4, 1] : [1, 1.15, 1],
                  opacity: isSpeaking ? [0.3, 0.1, 0.3] : [0.2, 0.1, 0.2],
                }}
                transition={{
                  duration: isSpeaking ? 0.8 : 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className={`absolute w-36 h-36 rounded-full ${
                  isSpeaking ? "bg-teal-500/30" : "bg-blue-500/25"
                }`}
                animate={{
                  scale: isSpeaking ? [1, 1.3, 1] : [1, 1.1, 1],
                  opacity: isSpeaking ? [0.4, 0.15, 0.4] : [0.25, 0.15, 0.25],
                }}
                transition={{
                  duration: isSpeaking ? 0.6 : 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.1,
                }}
              />
            </>
          )}

          {status === "connecting" && (
            <motion.div
              className="absolute w-36 h-36 rounded-full border-2 border-blue-400/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}

          <div
            className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center ${
              status === "connected"
                ? isSpeaking
                  ? "bg-teal-500/40 border-2 border-teal-400/60"
                  : "bg-blue-500/30 border-2 border-blue-400/50"
                : status === "error"
                ? "bg-red-500/30 border-2 border-red-400/50"
                : "bg-white/10 border-2 border-white/20"
            }`}
          >
            {status === "error" ? (
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-red-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </div>
        </div>

        {/* End call button */}
        <motion.button
          onClick={handleClose}
          className="px-10 py-4 rounded-2xl bg-red-500/80 hover:bg-red-500 text-white text-lg
            font-semibold backdrop-blur-md border border-red-400/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Gespräch beenden
        </motion.button>

        {status === "error" && (
          <motion.button
            onClick={handleRetry}
            className="mt-4 px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-base
              backdrop-blur-md border border-white/20 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Erneut versuchen
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
