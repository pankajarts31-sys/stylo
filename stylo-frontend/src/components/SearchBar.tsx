"use client";

import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
      <Search
        size={16}
        style={{
          position: "absolute",
          left: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--fg-muted)",
          pointerEvents: "none",
        }}
      />
      <input
        id="feed-search"
        type="text"
        className="input-glass"
        placeholder="Search looks, brands, tags…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingLeft: "2.5rem", paddingRight: value ? "2.5rem" : "1rem" }}
      />
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(201,184,245,0.3)",
              border: "none",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--fg-secondary)",
            }}
          >
            <X size={11} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
