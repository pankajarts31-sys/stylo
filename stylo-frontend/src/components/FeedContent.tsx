"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowUpDown, Sparkles, RefreshCw, Camera } from "lucide-react";
// @ts-ignore
import Masonry from "react-masonry-css";
import FeedCard from "@/components/FeedCard";
import FilterBar from "@/components/FilterBar";
import PremiumSearchBar from "@/components/PremiumSearchBar";
import type { FeedItem, FeedCategory } from "@/data/feedData";
import { CATEGORIES } from "@/data/feedData";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PAGE_SIZE = 6;

type SortOption = "trending" | "newest" | "price-asc" | "price-desc" | "popular";
const SORT_LABELS: Record<SortOption, string> = {
  trending: "🔥 Trending",
  newest: "✦ Newest",
  "price-asc": "$ Low → High",
  "price-desc": "$ High → Low",
  popular: "💜 Most Saved",
};

export default function FeedContent() {
  const [category, setCategory] = useState<FeedCategory>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("trending");
  const [sortOpen, setSortOpen] = useState(false);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Map frontend sort → backend sort param
  const backendSort = (s: SortOption) => {
    if (s === "newest") return "trending";
    if (s === "popular") return "popular";
    if (s === "price-asc") return "price-asc";
    if (s === "price-desc") return "price-desc";
    return "trending";
  };

  // Fetch from backend
  const fetchItems = async (p: number, reset: boolean) => {
    if (fetching) return;
    setFetching(true);
    if (reset) setLoading(true);
    setError(null);
    try {
      const skip = (p - 1) * PAGE_SIZE;
      const params = new URLSearchParams({
        category,
        search,
        sort: backendSort(sort),
        skip: String(skip),
        limit: String(PAGE_SIZE),
      });
      const res = await fetch(`${API}/api/feed?${params}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      // Map backend _id → id for FeedCard compatibility
      const mapped: FeedItem[] = data.items.map((item: Record<string, unknown>) => ({
        ...item,
        id: item._id ?? item.id,
      })) as FeedItem[];

      setItems((prev) => (reset ? mapped : [...prev, ...mapped]));
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feed");
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  // Reset on filter/sort change
  useEffect(() => {
    setPage(1);
    fetchItems(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search, sort]);

  // Infinite scroll using IntersectionObserver
  const hasMore = items.length < total;
  useEffect(() => {
    if (!loaderRef.current || !hasMore || fetching) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((p) => {
            const next = p + 1;
            fetchItems(next, false);
            return next;
          });
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, fetching, items.length]);

  return (
    <main style={{ minHeight: "calc(100vh - 68px)", padding: "0 1.5rem 5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ paddingTop: "2.5rem", marginBottom: "2rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <TrendingUp size={22} style={{ color: "#9b59b6" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9b59b6", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Live Trends · Google Shopping
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "var(--fg-primary)", lineHeight: 1.2 }}>
            What&apos;s <span className="gradient-text">Trending</span> Right Now
          </h1>
          <p style={{ color: "var(--fg-secondary)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            Curated looks and statement pieces loved by the STYLO community ✦
          </p>
        </motion.div>

        {/* ── Premium Search Bar ── */}
        <motion.div
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           style={{ marginBottom: "2rem" }}
        >
          <PremiumSearchBar onSearch={(query) => setSearch(query)} />
        </motion.div>

        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", justifyContent: "space-between" }}
        >
          <div style={{ flex: 1 }}></div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSortOpen((o) => !o)}
                style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.6rem 1.1rem", borderRadius: "50px", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(201,184,245,0.4)", cursor: "pointer", color: "var(--fg-secondary)", fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap" }}
              >
                <ArrowUpDown size={14} />{SORT_LABELS[sort]}
              </motion.button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="glass"
                    style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 20, borderRadius: "16px", padding: "0.5rem", minWidth: "180px", boxShadow: "0 12px 40px rgba(140,100,220,0.18)" }}
                  >
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                      <button key={opt} onClick={() => { setSort(opt); setSortOpen(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "0.6rem 0.85rem", borderRadius: "10px", border: "none", background: sort === opt ? "rgba(201,184,245,0.2)" : "transparent", color: sort === opt ? "#9b59b6" : "var(--fg-secondary)", fontWeight: sort === opt ? 600 : 500, fontSize: "0.875rem", cursor: "pointer" }}
                      >{SORT_LABELS[opt]}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </motion.div>

        {/* ── Category filter ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} style={{ marginBottom: "2rem" }}>
          <FilterBar active={category} onChange={setCategory} />
        </motion.div>

        {/* ── Status / count ── */}
        <div style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {loading ? (
            <><RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> Loading from Google Shopping…</>
          ) : error ? (
            <span style={{ color: "#e74c3c" }}>⚠ {error}</span>
          ) : (
            <>{total} look{total !== 1 ? "s" : ""} found{search && ` for "${search}"`}</>
          )}
        </div>

        {/* ── Grid ── */}
        {!loading && items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", paddingTop: "4rem", color: "var(--fg-muted)" }}>
            <Sparkles size={40} style={{ color: "rgba(201,184,245,0.5)", marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.05rem" }}>No looks match your search.</p>
          </motion.div>
        ) : (
          <Masonry
            breakpointCols={{
              default: 4,
              1100: 3,
              768: 2,
              500: 1
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item, i) => <FeedCard key={item.id} item={item} index={i % PAGE_SIZE} />)}
            </AnimatePresence>
          </Masonry>
        )}

        {/* ── Infinite scroll sentinel ── */}
        <div ref={loaderRef} style={{ height: "60px", marginTop: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {fetching && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: "6px" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #c9b8f5, #f5b8d8)", animation: `bounce 0.6s ease-in-out ${i * 0.15}s infinite alternate`, display: "inline-block" }} />
              ))}
              <style>{`@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-8px)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </motion.div>
          )}
          {!hasMore && items.length > 0 && (
            <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)" }}>✦ You&apos;ve seen it all — {total} looks</p>
          )}
        </div>
      </div>

    </main>
  );
}
