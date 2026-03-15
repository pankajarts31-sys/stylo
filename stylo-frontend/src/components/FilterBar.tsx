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
        gap: "0.75rem",
        overflowX: "auto",
        paddingBottom: "4px",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        flexWrap: "wrap",
        alignItems: "center",
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
              padding: "0.6rem 1.5rem",
              borderRadius: "50px",
              border: isActive ? "none" : "1px solid rgba(255,255,255,0.1)",
              background: isActive
                ? "linear-gradient(135deg, #e83e8c, #6c5ce7)"
                : "rgba(255,255,255,0.05)",
              color: isActive ? "white" : "#d1d5db",
              fontWeight: isActive ? 700 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: isActive
                ? "0 4px 20px rgba(232,62,140,0.3)"
                : "none",
              transition: "background 0.2s ease, color 0.2s ease",
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
