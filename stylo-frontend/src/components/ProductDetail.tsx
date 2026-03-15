"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, ShoppingBag, Store, ExternalLink,
  TrendingDown, ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { FeedItem } from "@/data/feedData";
import FeedCard from "@/components/FeedCard";

interface ProductDetailProps {
  item: FeedItem;
  allItems: FeedItem[];
  onClose: () => void;
  onSelect: (item: FeedItem) => void;
}

export default function ProductDetail({ item, allItems, onClose, onSelect }: ProductDetailProps) {
  const router = useRouter();

  const thumbnail = item.thumbnail;
  const source = item.source;
  const buyLink = item.link;
  const price = item.price;
  const brand = item.brand ?? source ?? "Fashion";

  // Related products: everything except the selected one
  const related = allItems.filter((i) => i.id !== item.id);

  const handleBestDeal = () => {
    onClose();
    router.push(`/deals?q=${encodeURIComponent(item.title)}`);
  };

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [item.id]);

  return (
    <div style={{ maxWidth: "1800px", margin: "0 auto" }}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          padding: "0.5rem 1rem", borderRadius: "50px",
          background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(201,184,245,0.3)",
          cursor: "pointer", color: "var(--fg-secondary)",
          fontSize: "0.85rem", fontWeight: 500, marginBottom: "1.5rem",
        }}
      >
        <ArrowLeft size={16} />
        Back to all looks
      </motion.button>

      {/* ── Selected product: big card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="product-detail-card"
        style={{
          display: "flex",
          background: "white",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 12px 48px rgba(140,100,220,0.15)",
          marginBottom: "2.5rem",
          minHeight: "420px",
        }}
      >
        {/* Left: Big Image */}
        <div
          style={{
            flex: "0 0 50%",
            position: "relative",
            background: "#f8f8f8",
            overflow: "hidden",
          }}
        >
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
                background: "#f8f8f8",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                minHeight: "420px",
                background:
                  (item.imageGradient as string | undefined) ??
                  "linear-gradient(135deg, #c9b8f5, #f5b8d8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "5rem",
              }}
            >
              {(item.imageEmoji as string | undefined) ?? "🛍️"}
            </div>
          )}

          {/* Source badge */}
          {source && (
            <div
              style={{
                position: "absolute",
                top: 16, left: 16,
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                borderRadius: "50px",
                padding: "0.35rem 0.85rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#2d1b69",
                display: "flex", alignItems: "center", gap: "0.3rem",
              }}
            >
              <Store size={13} />
              {source}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div
          style={{
            flex: 1,
            padding: "2rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Close */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                background: "rgba(0,0,0,0.05)", border: "none",
                cursor: "pointer", borderRadius: "50%",
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#666",
              }}
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* Brand */}
          <span
            style={{
              fontSize: "0.78rem", fontWeight: 700, color: "#9b59b6",
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: "0.5rem",
            }}
          >
            {brand}
          </span>

          {/* Title */}
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3, marginBottom: "1rem" }}>
            {item.title}
          </h2>

          {/* Price */}
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1a1a2e", marginBottom: "1.5rem" }}>
            {typeof price === "number" ? `₹${price.toLocaleString("en-IN")}` : price}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "0.25rem 0.65rem", borderRadius: "50px",
                    background: "rgba(155,89,182,0.08)", color: "#9b59b6",
                    fontSize: "0.75rem", fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "auto" }}>
            {/* Best Deal — primary CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBestDeal}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "0.6rem", padding: "0.9rem",
                borderRadius: "14px", border: "none",
                background: "linear-gradient(135deg, #1abc9c, #16a085)",
                color: "white", fontSize: "0.95rem", fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(26,188,156,0.3)",
              }}
            >
              <TrendingDown size={18} />
              Best Deal — Compare Prices
            </motion.button>

            {/* Buy Now */}
            {buyLink && (
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.5rem", padding: "0.8rem",
                  borderRadius: "14px",
                  border: "1.5px solid rgba(155,89,182,0.25)",
                  background: "rgba(155,89,182,0.04)",
                  color: "#9b59b6", fontSize: "0.9rem", fontWeight: 600,
                  textDecoration: "none", cursor: "pointer",
                }}
              >
                <ShoppingBag size={16} />
                Buy from {source ?? "Store"}
                <ExternalLink size={13} style={{ opacity: 0.5 }} />
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── More Products heading ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: "1.25rem" }}
      >
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--fg-primary)" }}>
          More like this
        </h3>
      </motion.div>

      {/* ── Related products grid — remaining cards visible below ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {related.map((r, i) => (
          <FeedCard key={r.id} item={r} index={i % 6} onSelect={onSelect} />
        ))}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 700px) {
          .product-detail-card {
            flex-direction: column !important;
          }
          .product-detail-card > div:first-child {
            max-height: 320px !important;
            flex: none !important;
          }
        }
      `}</style>
    </div>
  );
}
