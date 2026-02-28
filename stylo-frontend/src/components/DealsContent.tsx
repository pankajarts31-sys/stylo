"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowUpDown, Zap, TrendingDown } from "lucide-react";
import DealCard from "@/components/DealCard";
import SearchBar from "@/components/SearchBar";
import DEALS_DATA, { DEAL_CATEGORIES, type DealCategory } from "@/data/dealsData";

type SortOption = "savings" | "price-asc" | "price-desc" | "rating" | "popular";
const SORT_LABELS: Record<SortOption, string> = {
  savings: "💰 Best Savings",
  "price-asc": "$ Lowest First",
  "price-desc": "$ Highest First",
  rating: "⭐ Top Rated",
  popular: "🔥 Most Reviewed",
};

const STAT_CARDS = [
  { icon: "🛍️", value: "6", label: "Products tracked" },
  { icon: "🏪", value: "20+", label: "Stores compared" },
  { icon: "💰", value: "Up to 40%", label: "Max savings found" },
  { icon: "⚡", value: "Real-time", label: "Price updates" },
];

export default function DealsContent() {
  const [category, setCategory] = useState<DealCategory>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("savings");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let items = DEALS_DATA;

    if (category !== "All") {
      items = items.filter((i) => i.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          i.category.toLowerCase().includes(q)
      );
    }

    return [...items].sort((a, b) => {
      const aBest = Math.min(...a.stores.map((s) => s.price));
      const bBest = Math.min(...b.stores.map((s) => s.price));
      switch (sort) {
        case "savings":
          return (b.savingsPercent ?? 0) - (a.savingsPercent ?? 0);
        case "price-asc":
          return aBest - bBest;
        case "price-desc":
          return bBest - aBest;
        case "rating":
          return b.rating - a.rating;
        case "popular":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });
  }, [category, search, sort]);

  return (
    <main style={{ minHeight: "calc(100vh - 68px)", padding: "0 1.5rem 5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ paddingTop: "2.5rem", marginBottom: "2rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <TrendingDown size={20} style={{ color: "#27ae60" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#27ae60", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Smart Shopping
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "var(--fg-primary)", lineHeight: 1.2 }}>
            Best{" "}
            <span className="gradient-text">Deals</span>{" "}
            Across 20+ Stores
          </h1>
          <p style={{ color: "var(--fg-secondary)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            Real-time price comparison so you always pay the least for the looks you love ✦
          </p>
        </motion.div>

        {/* ── Stat pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}
        >
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className="glass"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.55rem 1rem",
                borderRadius: "14px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--fg-primary)" }}>{s.value}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--fg-muted)", lineHeight: 1.2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}
        >
          <SearchBar value={search} onChange={setSearch} />

          {/* Sort */}
          <div style={{ position: "relative" }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSortOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.6rem 1.1rem",
                borderRadius: "50px",
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(201,184,245,0.4)",
                cursor: "pointer",
                color: "var(--fg-secondary)",
                fontSize: "0.85rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              <ArrowUpDown size={14} />
              {SORT_LABELS[sort]}
            </motion.button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="glass"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 20,
                    borderRadius: "16px",
                    padding: "0.5rem",
                    minWidth: "185px",
                    boxShadow: "0 12px 40px rgba(140,100,220,0.18)",
                  }}
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSort(opt); setSortOpen(false); }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "10px",
                        border: "none",
                        background: sort === opt ? "rgba(201,184,245,0.2)" : "transparent",
                        color: sort === opt ? "#9b59b6" : "var(--fg-secondary)",
                        fontWeight: sort === opt ? 600 : 500,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                      }}
                    >
                      {SORT_LABELS[opt]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Category filter ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "4px", marginBottom: "2rem", scrollbarWidth: "none" }}
        >
          {DEAL_CATEGORIES.map((cat) => {
            const isActive = category === cat;
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: "0.5rem 1.25rem",
                  borderRadius: "50px",
                  border: isActive ? "none" : "1.5px solid rgba(201,184,245,0.4)",
                  background: isActive ? "linear-gradient(135deg, #b8f5e8, #1abc9c)" : "rgba(255,255,255,0.5)",
                  color: isActive ? "#1a7a5e" : "var(--fg-secondary)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  boxShadow: isActive ? "0 4px 14px rgba(26,188,156,0.3)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {cat}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Result count ── */}
        <div style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Zap size={13} style={{ color: "#27ae60" }} />
          {filtered.length === 0
            ? "No deals found"
            : `${filtered.length} deal${filtered.length !== 1 ? "s" : ""} tracked`}
          {search && ` for "${search}"`}
        </div>

        {/* ── Deals Grid ── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", paddingTop: "4rem", color: "var(--fg-muted)" }}
          >
            <ShoppingBag size={40} style={{ color: "rgba(201,184,245,0.5)", marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.05rem" }}>No deals match your search.</p>
          </motion.div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filtered.map((item, i) => (
              <DealCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}

        {/* ── Footer note ── */}
        {filtered.length > 0 && (
          <p style={{ textAlign: "center", marginTop: "3rem", fontSize: "0.78rem", color: "var(--fg-muted)" }}>
            ✦ Prices are updated periodically. Always verify on the retailer's site before purchasing.
          </p>
        )}
      </div>
    </main>
  );
}
