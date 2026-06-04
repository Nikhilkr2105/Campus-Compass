"use client";

import {
  useState, useRef, useEffect, useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Trash2, Copy, Check } from "lucide-react";

// ── Types ────────────────────────────────────────────
interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  timestamp: Date;
}

// API shape — only role+content, no extra fields
interface ApiMessage {
  role:    "user" | "assistant";
  content: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const QUICK_PROMPTS = [
  "How to reach Library?",
  "Where is Medical Center?",
  "Where is the CSE department?",
  "Where is the Canteen?",
];

const INITIAL: Message = {
  id:        "init",
  role:      "assistant",
  content:   "Hi! I'm Campus Assistant, your AI guide to campus. Ask me for directions, building info, or anything campus-related.",
  timestamp: new Date(),
};

const CHAT_TOGGLE_EVENT = "rimt-ai-chat:toggle";
const CHAT_STATE_EVENT  = "rimt-ai-chat:state";

// ── Typing dots ──────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full inline-block"
          style={{ background: "var(--cyan)" }}
          animate={{
            opacity: [0.3, 1, 0.3],
            y:       [0, -4, 0],
            scale:   [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 0.8,
            delay:    i * 0.15,
            repeat:   Infinity,
            ease:     "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Message bubble ───────────────────────────────────
function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [copied,      setCopied]      = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour:   "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex flex-col gap-1" style={{ maxWidth: "82%" }}>
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-3 text-[13px] leading-relaxed"
          style={{
            background: isUser
              ? "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(0,212,255,0.08))"
              : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
            border: `1px solid ${isUser
              ? "rgba(0,212,255,0.35)"
              : "rgba(255,255,255,0.12)"}`,
            borderRadius: isUser
              ? "16px 16px 6px 16px"
              : "16px 16px 16px 6px",
            color:      "var(--text-1)",
            fontFamily: "var(--font-body)",
            boxShadow:  isUser
              ? "0 4px 16px rgba(0,212,255,0.08)"
              : "0 4px 16px rgba(0,0,0,0.2)",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </motion.div>

        {/* Actions & Timestamp */}
        <motion.div
          animate={{ opacity: showActions ? 1 : 0.6 }}
          transition={{ duration: 0.15 }}
          className={`flex items-center gap-2 px-1 text-[10px] ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span style={{ color: "var(--text-3)" }}>
            {formatTime(message.timestamp)}
          </span>

          {showActions && !isUser && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{
                background: "rgba(0,212,255,0.1)",
                border:     "1px solid rgba(0,212,255,0.2)",
                color:      copied ? "var(--green)" : "var(--cyan)",
                cursor:     "pointer",
                transition: "all 0.2s",
              }}
              title={copied ? "Copied!" : "Copy message"}
            >
              {copied
                ? <Check className="w-3.5 h-3.5" />
                : <Copy  className="w-3.5 h-3.5" />}
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main AIChat component ────────────────────────────
export function AIChat() {
  const [open,        setOpen]        = useState(false);
  const [messages,    setMessages]    = useState<Message[]>([INITIAL]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(QUICK_PROMPTS);

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  // Toggle event from external buttons
  useEffect(() => {
    const handleToggle = () => setOpen((v) => !v);
    window.addEventListener(CHAT_TOGGLE_EVENT, handleToggle);
    return () => window.removeEventListener(CHAT_TOGGLE_EVENT, handleToggle);
  }, []);

  // Broadcast open state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(CHAT_STATE_EVENT, { detail: { open } }));
  }, [open]);

  // ── Core send ───────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);

    // 1. Append user message immediately
    const userMsg: Message = {
      id:        uid(),
      role:      "user",
      content:   trimmed,
      timestamp: new Date(),
    };

    // Use functional update so we always have latest messages
    setMessages((prev) => {
      const next = [...prev, userMsg];
      // Kick off API call inside the updater's callback using the fresh array
      void callApi(next);
      return next;
    });

    setInput("");
    setLoading(true);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Separate async function so we can pass the already-updated array
  const callApi = async (currentMessages: Message[]) => {
    try {
      // Strip internal fields — send only role + content
      const history: ApiMessage[] = currentMessages
        .filter((m) => m.content.trim() !== "")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
      });

      // Parse error body if available
      if (!res.ok) {
        let errText = `API error ${res.status}`;
        try {
          const errData = await res.json();
          if (errData?.error) errText = errData.error;
        } catch { /* ignore parse failure */ }
        throw new Error(errText);
      }

      const data = await res.json();

      // data.content is the string reply from route.ts
      const replyText: string =
        typeof data.content === "string" && data.content.trim()
          ? data.content.trim()
          : "Sorry, I couldn't get a response. Please try again.";

      const assistantMsg: Message = {
        id:        uid(),
        role:      "assistant",
        content:   replyText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update chips: use backend suggestions if valid array, else keep current
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(
          data.suggestions
            .filter((s: unknown) => typeof s === "string" && s.trim())
            .slice(0, 5)
        );
      }

    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Connection issue. Please try again.";

      setError(msg);

      setMessages((prev) => [
        ...prev,
        {
          id:        uid(),
          role:      "assistant",
          content:   `⚠️ ${msg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Chip click ──────────────────────────────────────
  // Direct call — bypasses input state entirely
  const handleChipClick = (q: string) => {
    if (loading) return;
    sendMessage(q);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([INITIAL]);
    setError(null);
    setSuggestions(QUICK_PROMPTS);
  };

  // ── Render ──────────────────────────────────────────
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
                    Campus Assistant
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-[5px] h-[5px] rounded-full inline-block"
                      style={{ background: loading ? "var(--cyan)" : "var(--green)" }}
                    />
                    <span
                      className="text-[10px]"
                      style={{
                        color:      loading ? "var(--cyan)" : "var(--green)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {loading ? "Thinking…" : "Online"}
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
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 no-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <Bubble key={m.id} message={m} />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex justify-start"
                >
                  <div
                    style={{
                      background:   "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                      border:       "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "16px 16px 16px 6px",
                      boxShadow:    "0 4px 16px rgba(0,0,0,0.2)",
                    }}
                  >
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              {/* Inline error banner */}
              {error && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] px-3 py-2 rounded-lg text-center"
                  style={{
                    background: "rgba(255,80,80,0.08)",
                    border:     "1px solid rgba(255,80,80,0.2)",
                    color:      "#ff7070",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {error}
                </motion.div>
              )}

              <div ref={endRef} />
            </div>

            {/* Suggestion chips — dynamic from backend, fallback to QUICK_PROMPTS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={suggestions.join("|")}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                {suggestions.map((q) => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChipClick(q)}
                    disabled={loading}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap"
                    style={{
                      background: "rgba(0,212,255,0.07)",
                      border:     "1px solid rgba(0,212,255,0.2)",
                      color:      "var(--cyan)",
                      cursor:     loading ? "not-allowed" : "pointer",
                      opacity:    loading ? 0.5 : 1,
                      fontFamily: "var(--font-body)",
                      transition: "opacity 0.2s",
                    }}
                  >
                    {q}
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Input row */}
            <div
              className="px-4 py-3 flex gap-2.5 items-center flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about campus…"
                disabled={loading}
                className="flex-1 text-[13px] px-3.5 py-2.5 rounded-xl outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border:     "1px solid rgba(255,255,255,0.09)",
                  color:      "var(--text-1)",
                  fontFamily: "var(--font-body)",
                  transition: "border-color 0.2s",
                  opacity:    loading ? 0.6 : 1,
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
                  background: "rgba(0,212,255,0.15)",
                  border:     "1px solid rgba(0,212,255,0.35)",
                  color:      "var(--cyan)",
                  cursor:     (!input.trim() || loading) ? "not-allowed" : "pointer",
                  opacity:    (!input.trim() || loading) ? 0.5 : 1,
                  transition: "opacity 0.2s",
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