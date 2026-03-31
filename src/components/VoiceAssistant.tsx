"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "./BackButton";
import { generateTicketId } from "@/lib/api";

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";
type ViewState = "call" | "success";

interface VoiceAssistantProps {
  onClose: () => void;
}

export default function VoiceAssistant({ onClose }: VoiceAssistantProps) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [view, setView] = useState<ViewState>("call");
  const [ticketId, setTicketId] = useState("");
  const [transcript, setTranscript] = useState<string[]>([]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goodbyeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);
  const mountedRef = useRef(true);
  const transcriptRef = useRef<string[]>([]);
  const goodbyeDetectedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  function cleanup() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (goodbyeTimerRef.current) clearTimeout(goodbyeTimerRef.current);
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
    goodbyeDetectedRef.current = false;
  }

  function showSuccessScreen() {
    cleanup();
    const id = generateTicketId();
    setTicketId(id);
    setTranscript([...transcriptRef.current]);
    setView("success");

    // Auto-redirect nach 5 Sekunden
    autoCloseRef.current = setTimeout(() => {
      onCloseRef.current();
    }, 5000);
  }

  function resetInactivityTimeout() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      showSuccessScreen();
    }, 5 * 60 * 1000);
  }

  function checkForGoodbye(text: string) {
    const lower = text.toLowerCase();
    const goodbyePhrases = [
      "auf wiedersehen",
      "auf wiederhören",
      "einen schönen tag noch",
      "sie können jetzt auflegen",
      "können jetzt auflegen",
    ];
    return goodbyePhrases.some((phrase) => lower.includes(phrase));
  }

  async function connect() {
    setStatus("connecting");
    setErrorMessage("");
    transcriptRef.current = [];

    try {
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

      const pc = new RTCPeerConnection();
      if (!mountedRef.current) { pc.close(); return; }
      pcRef.current = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        pc.close();
        return;
      }
      streamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      let greetingSent = false;
      dc.onopen = () => {
        if (greetingSent) return;
        greetingSent = true;
        // Einfacher Trigger - Arne folgt seinem System-Prompt für die Begrüßung
        dc.send(JSON.stringify({
          type: "response.create"
        }));
      };

      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);

          if (event.type === "response.audio.delta") {
            setIsSpeaking(true);
            resetInactivityTimeout();
          } else if (event.type === "response.audio.done") {
            setIsSpeaking(false);
          } else if (event.type === "input_audio_buffer.speech_started") {
            resetInactivityTimeout();
          }

          // Arne's Antwort-Transkript erfassen + Goodbye merken
          if (event.type === "response.audio_transcript.done" && event.transcript) {
            transcriptRef.current.push(`Arne: ${event.transcript}`);
            if (checkForGoodbye(event.transcript)) {
              goodbyeDetectedRef.current = true;
            }
          }

          // response.done = Arne hat KOMPLETT zu Ende gesprochen
          // Erst jetzt den Erfolgsscreen zeigen, wenn Goodbye erkannt wurde
          if (event.type === "response.done" && goodbyeDetectedRef.current) {
            // Warte bis Audio wirklich fertig abgespielt ist
            if (goodbyeTimerRef.current) clearTimeout(goodbyeTimerRef.current);
            goodbyeTimerRef.current = setTimeout(() => {
              if (mountedRef.current) {
                showSuccessScreen();
              }
            }, 2000);
          }

          // Nutzer-Transkript erfassen
          if (event.type === "conversation.item.input_audio_transcription.completed" && event.transcript) {
            transcriptRef.current.push(`Mieter: ${event.transcript}`);
          }
        } catch {
          // ignore parse errors
        }
      };

      const offer = await pc.createOffer();
      if (!mountedRef.current) { pc.close(); return; }
      await pc.setLocalDescription(offer);

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

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      cleanup();
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    cleanup();
    onClose();
  };

  const handleEndCall = () => {
    showSuccessScreen();
  };

  const handleRetry = () => {
    cleanup();
    connect();
  };

  // Erfolgsscreen nach Gesprächsende
  if (view === "success") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-center max-w-lg px-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {/* Checkmark */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/30 border-2 border-emerald-400/50 flex items-center justify-center">
            <motion.svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">
            Anliegen aufgenommen
          </h2>

          <p className="text-white/60 text-lg mb-2">
            Ihre Ticket-Nummer:
          </p>
          <p className="text-emerald-400 font-mono font-bold text-2xl mb-4">
            {ticketId}
          </p>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-5 mb-6 text-left">
            <p className="text-white/70 text-sm leading-relaxed">
              Ihr Anliegen wurde erfolgreich erfasst. Die Hausverwaltung wird sich
              innerhalb der nächsten Tage bei Ihnen melden. Bitte notieren Sie sich
              die Ticket-Nummer für Rückfragen.
            </p>
          </div>

          {transcript.length > 0 && (
            <details className="mb-6 text-left">
              <summary className="text-white/40 text-sm cursor-pointer hover:text-white/60 transition-colors">
                Gesprächsprotokoll anzeigen
              </summary>
              <div className="mt-3 bg-white/5 rounded-xl border border-white/10 p-4 max-h-48 overflow-y-auto">
                {transcript.map((line, i) => (
                  <p
                    key={i}
                    className={`text-sm mb-1.5 ${
                      line.startsWith("Arne:")
                        ? "text-teal-400/80"
                        : "text-white/50"
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </details>
          )}

          <motion.button
            onClick={handleClose}
            className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white
              backdrop-blur-md border border-white/20 transition-colors text-base font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Zurück zum Startbildschirm
          </motion.button>

          <p className="text-white/30 text-sm mt-4">
            Automatische Weiterleitung in 5 Sekunden...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <BackButton onClick={handleClose} label="Beenden" />

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

        <motion.button
          onClick={handleEndCall}
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
