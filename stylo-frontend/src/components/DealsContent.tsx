"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowUpDown, Zap, TrendingDown, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Masonry from "react-masonry-css";
import DealCard from "@/components/DealCard";
import PremiumSearchBar from "@/components/PremiumSearchBar";
import { useGender } from "@/context/GenderContext";
import { DEAL_CATEGORIES, type DealCategory } from "@/data/dealsData";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface DealStore {
  store: string;
  storeLogo: string;
  price: number;
  currency: string;
  inStock: boolean;
  shippingDays: number;
  url: string;
  deal: string | null;
}

interface Deal {
  id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  imageGradient: string;
  imageEmoji: string;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  isHotDeal: boolean;
  savingsPercent: number;
  tags: string[];
  stores: DealStore[];
}

type SortOption = "savings" | "price-asc" | "price-desc" | "rating" | "popular";
const SORT_LABELS: Record<SortOption, string> = {
  savings: "💰 Best Savings",
  "price-asc": "₹ Lowest First",
  "price-desc": "₹ Highest First",
  rating: "⭐ Top Rated",
  popular: "🔥 Most Reviewed",
};

const STAT_CARDS = [
  { icon: "🛍️", value: "Live", label: "Product search" },
  { icon: "🏪", value: "20+", label: "Indian stores" },
  { icon: "💰", value: "Up to 40%", label: "Max savings found" },
  { icon: "⚡", value: "Real-time", label: "Price updates" },
];

export default function DealsContent() {
  const searchParams = useSearchParams();
  const { queryPrefix } = useGender();
  const initialQuery = searchParams.get("q") ?? "";
  const [category, setCategory] = useState<DealCategory>("All");
  const [search, setSearch] = useState(initialQuery);
  const [sort, setSort] = useState<SortOption>("savings");
  const [sortOpen, setSortOpen] = useState(false);
  const [dealsData, setDealsData] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync search when URL ?q= changes (e.g. navigated from Best Deal button)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    if (q) setSearch(q);
  }, [searchParams]);

  // Fetch deals from API whenever search/category changes
  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseQuery = search.trim() || "trending fashion";
        const query = `${queryPrefix}${baseQuery}`;
        const catParam = category !== "All" ? `&category=${encodeURIComponent(category)}` : "";
        const res = await fetch(`${API}/api/deals?q=${encodeURIComponent(query)}${catParam}`);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `API error ${res.status}`);
        }

        const data = await res.json();
        if (data && data.success) {
          setDealsData(data.deals || []);
        } else {
          setDealsData([]);
        }
      } catch (e) {
        console.error("Failed fetching live deals", e);
        setError(e instanceof Error ? e.message : "Failed to load deals");
        setDealsData([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => fetchDeals(), 500);
    return () => clearTimeout(debounce);
  }, [search, category, queryPrefix]);

  // Client-side sort
  const filtered = useMemo(() => {
    return [...dealsData].sort((a, b) => {
      const aBest = Math.min(...(a.stores || []).map((s: DealStore) => s.price));
      const bBest = Math.min(...(b.stores || []).map((s: DealStore) => s.price));
      switch (sort) {
        case "savings":
          return (b.savingsPercent ?? 0) - (a.savingsPercent ?? 0);
        case "price-asc":
          return aBest - bBest;
        case "price-desc":
          return bBest - aBest;
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "popular":
          return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        default:
          return 0;
      }
    });
  }, [dealsData, sort]);

  return (
    <main style={{ minHeight: "calc(100vh - 68px)", padding: "0 1.5rem 5rem" }}>
      <div style={{ maxWidth: "1800px", margin: "0 auto" }}>

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
            Across Indian Stores
          </h1>
          <p style={{ color: "var(--fg-secondary)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            Real-time price comparison across Amazon, Flipkart, Myntra, Meesho & more ✦
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

        {/* ── Premium Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ marginBottom: "1.5rem" }}
        >
          <PremiumSearchBar onSearch={(q) => setSearch(q)} />
        </motion.div>

        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}
        >
          <div style={{ flex: 1 }}></div>

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
          {loading ? (
            <><RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> Searching across Indian stores...</>
          ) : error ? (
            <span style={{ color: "#e74c3c" }}>⚠ {error}</span>
          ) : (
            <>
              <Zap size={13} style={{ color: "#27ae60" }} />
              {filtered.length === 0
                ? "No deals found"
                : `${filtered.length} deal${filtered.length !== 1 ? "s" : ""} tracked`}
              {search && ` for "${search}"`}
            </>
          )}
        </div>

        {/* ── Deals Grid ── */}
        {!loading && filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", paddingTop: "4rem", color: "var(--fg-muted)" }}
          >
            <ShoppingBag size={40} style={{ color: "rgba(201,184,245,0.5)", marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.05rem" }}>
              {error ? "Could not fetch deals. Check your backend server." : "No deals match your search."}
            </p>
          </motion.div>
        ) : loading ? (
          <div style={{ textAlign: "center", paddingTop: "4rem" }}>
            <RefreshCw size={32} style={{ color: "#9b59b6", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "var(--fg-muted)", marginTop: "1rem" }}>Finding best prices...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <Masonry
            breakpointCols={{
              default: 5,
              1500: 4,
              1100: 3,
              800: 2,
              600: 1
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {filtered.map((item, i) => (
              <DealCard key={item.id} item={item} index={i} />
            ))}
          </Masonry>
        )}

        {/* ── Footer note ── */}
        {filtered.length > 0 && (
          <p style={{ textAlign: "center", marginTop: "3rem", fontSize: "0.78rem", color: "var(--fg-muted)" }}>
            ✦ Prices are updated periodically. Always verify on the retailer&apos;s site before purchasing.
          </p>
        )}
      </div>
    </main>
  );
}
