"use client";

import {
  useState, useRef, useEffect, useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Trash2 } from "lucide-react";

// ── Types ────────────────────────────────────────────
interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  timestamp: Date;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const QUICK_PROMPTS = [
  "How to reach Library?",
  "Where is Medical Center?",
  "CSE Lab 3 location?",
  "Nearest washroom?",
];

const INITIAL: Message = {
  id:        "init",
  role:      "assistant",
  content:   "Hi! I'm your RIMT Campus AI. Ask me for directions, building info, or anything campus-related.",
  timestamp: new Date(),
};

// ── Typing dots ──────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[6px] h-[6px] rounded-full inline-block"
          style={{ background: "var(--cyan)" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, delay: i * 0.18, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ── Message bubble ───────────────────────────────────
function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className="max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed"
        style={{
          background:   isUser
            ? "rgba(0,212,255,0.13)"
            : "rgba(255,255,255,0.05)",
          border:       `1px solid ${isUser
            ? "rgba(0,212,255,0.28)"
            : "rgba(255,255,255,0.08)"}`,
          borderRadius: isUser
            ? "16px 16px 4px 16px"
            : "16px 16px 16px 4px",
          color:        "var(--text-1)",
          fontFamily:   "var(--font-body)",
        }}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

// ── Main AIChat component ────────────────────────────
export function AIChat() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const endRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: uid(), role: "user", content: trimmed, timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role:    m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id:        uid(),
          role:      "assistant",
          content:   data.content ?? "Sorry, I couldn't respond. Try again.",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id:        uid(),
          role:      "assistant",
          content:   "Connection issue. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => setMessages([INITIAL]);

  return (
    <>
      {/* ── Floating button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, boxShadow: "0 0 28px rgba(0,212,255,0.4)" }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50"
            style={{
              background:    "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(139,92,246,0.18))",
              border:        "1.5px solid rgba(0,212,255,0.45)",
              backdropFilter:"blur(12px)",
              boxShadow:     "0 0 24px rgba(0,212,255,0.2)",
              animation:     "float 3.5s ease-in-out infinite",
              cursor:        "pointer",
            }}
            title="AI Assistant"
          >
            <Bot className="w-6 h-6" style={{ color: "var(--cyan)" }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0, y: 16, scale: 0.96    }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col"
            style={{
              width:         340,
              height:        500,
              background:    "rgba(6,13,24,0.97)",
              border:        "1px solid rgba(0,212,255,0.22)",
              borderRadius:  20,
              backdropFilter:"blur(28px)",
              boxShadow:     "0 24px 60px rgba(0,0,0,0.55), 0 0 40px rgba(0,212,255,0.06)",
            }}
          >

            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(139,92,246,0.18))",
                    border:     "1.5px solid rgba(0,212,255,0.3)",
                  }}
                >
                  🤖
                </div>
                <div>
                  <div
                    className="text-[13px] font-semibold leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    RIMT AI
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-[5px] h-[5px] rounded-full inline-block animate-glow"
                      style={{ background: "var(--green)" }}
                    />
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--green)", fontFamily: "var(--font-body)" }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={clearChat}
                  title="Clear chat"
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", color: "var(--text-3)",
                    padding: 4,
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", color: "var(--text-2)",
                    padding: 4,
                  }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 no-scrollbar"
            >
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <Bubble key={m.id} message={m} />
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div
                    style={{
                      background:   "rgba(255,255,255,0.05)",
                      border:       "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px 16px 16px 4px",
                    }}
                  >
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              <div ref={endRef} />
            </div>

            {/* Quick chips */}
            <div
              className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              {QUICK_PROMPTS.map((q) => (
                <motion.button
                  key={q}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-colors"
                  style={{
                    background:   "rgba(0,212,255,0.07)",
                    border:       "1px solid rgba(0,212,255,0.2)",
                    color:        "var(--cyan)",
                    cursor:       loading ? "not-allowed" : "pointer",
                    opacity:      loading ? 0.5 : 1,
                    fontFamily:   "var(--font-body)",
                  }}
                >
                  {q}
                </motion.button>
              ))}
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 flex gap-2.5 items-center flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about campus..."
                disabled={loading}
                className="flex-1 text-[13px] px-3.5 py-2.5 rounded-xl outline-none"
                style={{
                  background:   "rgba(255,255,255,0.04)",
                  border:       "1px solid rgba(255,255,255,0.09)",
                  color:        "var(--text-1)",
                  fontFamily:   "var(--font-body)",
                  transition:   "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.35)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
              />
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: "0 0 14px rgba(0,212,255,0.3)" }}
                whileTap={{ scale: 0.93 }}
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:   "rgba(0,212,255,0.15)",
                  border:       "1px solid rgba(0,212,255,0.35)",
                  color:        "var(--cyan)",
                  cursor:       (!input.trim() || loading) ? "not-allowed" : "pointer",
                  opacity:      (!input.trim() || loading) ? 0.5 : 1,
                }}
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}