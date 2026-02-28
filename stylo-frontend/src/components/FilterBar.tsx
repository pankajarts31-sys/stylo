"use client";

import { motion } from "framer-motion";
import { CATEGORIES, type FeedCategory } from "@/data/feedData";

interface FilterBarProps {
  active: FeedCategory;
  onChange: (cat: FeedCategory) => void;
}

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        overflowX: "auto",
        paddingBottom: "4px",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      className="hide-scrollbar"
    >
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(cat)}
            style={{
              flexShrink: 0,
              padding: "0.5rem 1.25rem",
              borderRadius: "50px",
              border: isActive
                ? "none"
                : "1.5px solid rgba(201,184,245,0.4)",
              background: isActive
                ? "linear-gradient(135deg, #c9b8f5, #f5b8d8)"
                : "rgba(255,255,255,0.5)",
              color: isActive ? "#2d1b69" : "var(--fg-secondary)",
              fontWeight: isActive ? 700 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              boxShadow: isActive
                ? "0 4px 14px rgba(201,184,245,0.4)"
                : "none",
              transition: "background 0.2s ease, color 0.2s ease",
              letterSpacing: "0.01em",
            }}
          >
            {cat}
          </motion.button>
        );
      })}
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
