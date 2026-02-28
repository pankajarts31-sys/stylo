"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, RotateCcw } from "lucide-react";
import MessageBubble from "./MessageBubble";

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  streaming?: boolean;
}

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const WELCOME: Message = {
  id: "welcome",
  role: "model",
  content:
    "Hey there, gorgeous! ✦ I'm STYLO, your personal AI fashion stylist.\n\nTell me about an occasion you're dressing for, or ask me anything — from what to wear to a garden party to how to style wide-leg trousers. I'm all yours! 💜\n\nWhat's on your style agenda today?",
};

const SUGGESTIONS = [
  "What should I wear to a summer rooftop dinner?",
  "How do I style an oversized blazer?",
  "Give me a capsule wardrobe for autumn 🍂",
  "What colours suit a warm skin tone?",
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const buildHistory = (msgs: Message[]) =>
    msgs
      .filter((m) => m.id !== "welcome" && !m.streaming)
      .map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsStreaming(true);

      const aiMsgId = crypto.randomUUID();
      const aiMsg: Message = { id: aiMsgId, role: "model", content: "", streaming: true };
      setMessages((prev) => [...prev, aiMsg]);

      abortRef.current = new AbortController();

      try {
        const history = buildHistory([...messages, userMsg]);

        const res = await fetch(`${BACKEND}/api/stylist/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), history }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Server error ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") break;

            try {
              const parsed = JSON.parse(raw);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.delta) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: m.content + parsed.delta }
                      : m
                  )
                );
              }
            } catch (e) {
              // ignore parse errors on partial chunks
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const errText =
          err instanceof Error && err.message.includes("503")
            ? "⚠️ The backend is not configured yet. Please add your GEMINI_API_KEY to stylo-backend/.env and start the server."
            : `⚠️ Couldn't reach STYLO's brain. Make sure the FastAPI server is running on port 8000.\n\n_Error: ${err instanceof Error ? err.message : "Unknown error"}_`;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: errText, streaming: false } : m
          )
        );
      } finally {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== aiMsgId) return m;
            // If nothing was streamed, show a fallback error
            const finalContent =
              m.content.trim() ||
              "⚠️ STYLO couldn't respond right now. This usually means the Gemini API quota is exhausted or the API key is invalid. Please check your `.env` file and try again.";
            return { ...m, content: finalContent, streaming: false };
          })
        );
        setIsStreaming(false);
      }
    },
    [isStreaming, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setIsStreaming(false);
    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 68px)",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "1.5rem 1rem",
        gap: "1rem",
      }}
    >
      {/* ── Chat header ─────────────────────────────────────── */}
      <div
        className="glass"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.875rem 1.25rem",
          borderRadius: "18px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #c9b8f5, #f5b8d8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(201,184,245,0.45)",
            }}
          >
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--fg-primary)" }}>
              STYLO AI Stylist
            </div>
            <div style={{ fontSize: "0.75rem", color: isStreaming ? "#9b59b6" : "#27ae60", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: isStreaming ? "#9b59b6" : "#27ae60",
                  display: "inline-block",
                  animation: isStreaming ? "pulse 1s ease-in-out infinite" : "none",
                }}
              />
              {isStreaming ? "Styling…" : "Online · Gemini 1.5"}
            </div>
          </div>
        </div>

        <button
          onClick={reset}
          title="Start a new conversation"
          style={{
            background: "transparent",
            border: "1.5px solid rgba(201,184,245,0.4)",
            borderRadius: "10px",
            padding: "0.4rem 0.75rem",
            cursor: "pointer",
            color: "var(--fg-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.8rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          <RotateCcw size={13} /> New chat
        </button>
      </div>

      {/* ── Messages area ───────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          padding: "0.25rem 0.25rem",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(201,184,245,0.4) transparent",
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestion chips (only at start) ────────────────── */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(201,184,245,0.5)",
                borderRadius: "50px",
                padding: "0.4rem 0.9rem",
                fontSize: "0.8rem",
                color: "var(--fg-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backdropFilter: "blur(12px)",
                fontWeight: 500,
              }}
            >
              {s}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Input bar ───────────────────────────────────────── */}
      <div
        className="glass"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "0.75rem",
          padding: "0.75rem 0.75rem 0.75rem 1.1rem",
          borderRadius: "20px",
          flexShrink: 0,
        }}
      >
        <textarea
          ref={textareaRef}
          id="chat-input"
          rows={1}
          placeholder="Ask your stylist anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.93rem",
            color: "var(--fg-primary)",
            lineHeight: 1.55,
            overflow: "hidden",
            opacity: isStreaming ? 0.6 : 1,
          }}
        />
        <motion.button
          id="chat-send-btn"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            background:
              input.trim() && !isStreaming
                ? "linear-gradient(135deg, #c9b8f5, #f5b8d8)"
                : "rgba(201,184,245,0.2)",
            border: "none",
            cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.25s ease",
            boxShadow:
              input.trim() && !isStreaming
                ? "0 4px 14px rgba(201,184,245,0.45)"
                : "none",
          }}
        >
          <Send
            size={17}
            color={input.trim() && !isStreaming ? "#2d1b69" : "var(--fg-muted)"}
          />
        </motion.button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
