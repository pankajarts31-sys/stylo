"use client";

import { motion } from "framer-motion";
import type { Message } from "./ChatWindow";
import { Sparkles } from "lucide-react";

interface MessageBubbleProps {
  msg: Message;
}

export default function MessageBubble({ msg }: MessageBubbleProps) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: "0.6rem",
        maxWidth: "85%",
        alignSelf: isUser ? "flex-end" : "flex-start",
      }}
    >
      {/* Avatar — only for AI */}
      {!isUser && (
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #c9b8f5, #f5b8d8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(201,184,245,0.4)",
          }}
        >
          <Sparkles size={16} color="white" />
        </div>
      )}

      {/* Bubble */}
      <div
        style={{
          padding: "0.75rem 1.1rem",
          borderRadius: isUser ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
          background: isUser
            ? "linear-gradient(135deg, #c9b8f5, #f5b8d8)"
            : "rgba(255,255,255,0.65)",
          backdropFilter: isUser ? "none" : "blur(16px)",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.7)",
          boxShadow: isUser
            ? "0 4px 16px rgba(201,184,245,0.35)"
            : "0 4px 16px rgba(140,100,220,0.08)",
          color: "#2d1b69",
          fontSize: "0.92rem",
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          maxWidth: "100%",
          wordBreak: "break-word",
        }}
      >
        {msg.content}
        {/* Streaming cursor */}
        {msg.streaming && (
          <span
            style={{
              display: "inline-block",
              width: "2px",
              height: "14px",
              background: "#9b59b6",
              borderRadius: "1px",
              marginLeft: "3px",
              verticalAlign: "middle",
              animation: "blink 0.8s step-end infinite",
            }}
          />
        )}
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </motion.div>
  );
}
