"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowUpDown, Sparkles, RefreshCw, Camera, X as XIcon } from "lucide-react";
import Masonry from "react-masonry-css";
import FeedCard from "@/components/FeedCard";
import ProductDetail from "@/components/ProductDetail";
import FilterBar from "@/components/FilterBar";
import PremiumSearchBar from "@/components/PremiumSearchBar";
import { useGender } from "@/context/GenderContext";
import type { FeedItem, FeedCategory } from "@/data/feedData";
import { getApiBase } from "@/lib/api";

const API = getApiBase();
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
  const { queryPrefix } = useGender();
  const [category, setCategory] = useState<FeedCategory>("All");
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState<SortOption>("trending");
  const [sortOpen, setSortOpen] = useState(false);
  const [items, setItems]       = useState<FeedItem[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [visualQuery, setVisualQuery] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  // Use a ref for page to avoid "assigned but never read" ESLint warning
  const pageRef   = useRef(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  const backendSort = useCallback((s: SortOption) => {
    if (s === "price-asc")  return "price-asc";
    if (s === "price-desc") return "price-desc";
    return "trending";
  }, []);

  const fetchItems = useCallback(async (p: number, reset: boolean) => {
    if (fetching) return;
    setFetching(true);
    if (reset) setLoading(true);
    setError(null);
    try {
      const skip = (p - 1) * PAGE_SIZE;
      const baseSearch = search.trim() ? search : "fashion";
      const genderSearch = `${queryPrefix}${baseSearch}`;
      const params = new URLSearchParams({
        category: category !== "All" ? category : "",
        search:   genderSearch,
        sort:     backendSort(sort),
        skip:     String(skip),
        limit:    String(PAGE_SIZE),
      });
      const res = await fetch(`${API}/api/feed?${params}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const resItems = data.items || data.deals || data.shopping_results || [];
      const mapped: FeedItem[] = resItems.map((item: Record<string, unknown>) => ({
        ...item,
        id: item._id ?? item.id ?? Math.random().toString(36).substring(7),
      })) as FeedItem[];

      setItems((prev) => (reset ? mapped : [...prev, ...mapped]));
      setTotal(data.total || data.results_count || mapped.length || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feed");
    } finally {
      setFetching(false);
      setLoading(false);
    }
  }, [category, search, sort, fetching, backendSort, queryPrefix]);

  const handleVisualResults = useCallback((matches: FeedItem[], query: string) => {
    setVisualQuery(query);
    setItems(matches);
    setTotal(matches.length);
    setSearch("");
  }, []);

  const clearVisualResults = useCallback(() => {
    setVisualQuery(null);
    pageRef.current = 1;
    fetchItems(1, true);
  }, [fetchItems]);

  // Reset on filter/sort change
  useEffect(() => {
    pageRef.current = 1;
    fetchItems(1, true);
  }, [category, search, sort, queryPrefix]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll
  const hasMore = !visualQuery && items.length < total;
  useEffect(() => {
    if (!loaderRef.current || !hasMore || fetching) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const next = pageRef.current + 1;
          pageRef.current = next;
          fetchItems(next, false);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, fetching]); // eslint-disable-line react-hooks/exhaustive-deps

  // When a product is selected, show inline detail instead of the feed
  if (selectedItem) {
    return (
      <main style={{ minHeight: "calc(100vh - 68px)", padding: "2rem 1.5rem 5rem" }}>
        <ProductDetail
          item={selectedItem}
          allItems={items}
          onClose={() => setSelectedItem(null)}
          onSelect={setSelectedItem}
        />
      </main>
    );
  }

  return (
    <main style={{ minHeight: "calc(100vh - 68px)", padding: "0 1.5rem 5rem" }}>
      <div style={{ maxWidth: "1800px", margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ paddingTop: "2.5rem", marginBottom: "2rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <TrendingUp size={18} style={{ color: "#f06292" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#f06292", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Live Trends · Google Shopping
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", lineHeight: 1.15 }}>
            What&apos;s <span className="text-glow-trending" style={{ fontStyle: "italic" }}>Trending</span> Right Now
          </h1>
          <p style={{ color: "#9ca3af", marginTop: "0.5rem", fontSize: "0.95rem" }}>
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
          <PremiumSearchBar onSearch={(query) => { setVisualQuery(null); setSearch(query); }} onVisualResults={handleVisualResults} />
        </motion.div>

        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", justifyContent: "space-between" }}
        >
          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", position: "relative" }}>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setSortOpen((o) => !o)}
              style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.6rem 1.1rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#d1d5db", fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap" }}
            >
              <ArrowUpDown size={14} />{SORT_LABELS[sort]}
            </motion.button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="glass"
                  style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 20, borderRadius: "16px", padding: "0.5rem", minWidth: "180px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                    <button key={opt} onClick={() => { setSort(opt); setSortOpen(false); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "0.6rem 0.85rem", borderRadius: "10px", border: "none", background: sort === opt ? "rgba(232,62,140,0.15)" : "transparent", color: sort === opt ? "#e83e8c" : "#d1d5db", fontWeight: sort === opt ? 600 : 500, fontSize: "0.875rem", cursor: "pointer" }}
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
        <div style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {loading ? (
            <><RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> Loading from Google Shopping…</>
          ) : error ? (
            <span style={{ color: "#e74c3c" }}>⚠ {error}</span>
          ) : (
            <>{total} look{total !== 1 ? "s" : ""} found{search && ` for "${search}"`}</>
          )}
        </div>

        {/* ── Visual Search Banner ── */}
        {visualQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.85rem 1.25rem", borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(232,62,140,0.1), rgba(162,155,254,0.1))",
              border: "1px solid rgba(232,62,140,0.2)",
              marginBottom: "1.25rem",
            }}
          >
            <Camera size={18} style={{ color: "#e83e8c", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: "0.9rem", color: "white" }}>
              Visual search results for <strong>&ldquo;{visualQuery}&rdquo;</strong> — {total} match{total !== 1 ? "es" : ""}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={clearVisualResults}
              style={{
                background: "rgba(232,62,140,0.15)", border: "none", cursor: "pointer",
                color: "#e83e8c", borderRadius: "50%", padding: "0.4rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <XIcon size={14} />
            </motion.button>
          </motion.div>
        )}

        {/* ── Grid ── */}
        {!loading && items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", paddingTop: "4rem", color: "#6b7280" }}>
            <Sparkles size={40} style={{ color: "rgba(162,155,254,0.5)", marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.05rem" }}>No looks match your search.</p>
          </motion.div>
        ) : (
          <Masonry
            breakpointCols={{ default: 6, 1500: 5, 1100: 4, 768: 3, 500: 2, 400: 1 }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {items.map((item, i) => <FeedCard key={item.id} item={item} index={i % PAGE_SIZE} onSelect={setSelectedItem} />)}
          </Masonry>
        )}

        {/* ── Infinite scroll sentinel ── */}
        <div ref={loaderRef} style={{ height: "60px", marginTop: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {fetching && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: "6px" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #a29bfe, #e83e8c)", animation: `bounce 0.6s ease-in-out ${i * 0.15}s infinite alternate`, display: "inline-block" }} />
              ))}
              <style>{`@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-8px)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </motion.div>
          )}
          {!hasMore && items.length > 0 && (
            <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>✦ You&apos;ve seen it all — {total} looks</p>
          )}
        </div>
      </div>
    </main>
  );
}
