"use client";

import { motion } from "framer-motion";
import { Heart, Bookmark, ExternalLink, ShoppingBag, Store } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import type { FeedItem } from "@/data/feedData";

interface FeedCardProps {
  item: FeedItem;
  index: number;
}

export default function FeedCard({ item, index }: FeedCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes ?? 0);
  const [saveCount, setSaveCount] = useState(item.saves ?? 0);
  const [imgError, setImgError] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((v) => !v);
    setSaveCount((c) => (saved ? c - 1 : c + 1));
  };

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  // Real SerpApi items use `thumbnail`, `source`, and `link`. Legacy items use imageGradient/imageEmoji.
  const isRealProduct = Boolean(item.thumbnail);
  const thumbnail = item.thumbnail;
  const source = item.source;
  const buyLink = item.link;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: "0 24px 60px rgba(140,100,220,0.22)" }}
      className="glass"
      style={{ borderRadius: "20px", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}
    >
      {/* Image / Thumbnail */}
      <div
        style={{
          height: "220px",
          background: (item.imageGradient as string | undefined) ?? "linear-gradient(135deg, #c9b8f5, #f5b8d8)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "4rem",
          overflow: "hidden",
        }}
      >
        {isRealProduct && thumbnail && !imgError ? (
          <Image
            src={thumbnail}
            alt={item.title}
            fill
            style={{ objectFit: "cover" }}
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <span role="img" aria-label={item.title}>
            {(item.imageEmoji as string | undefined) ?? "🛍️"}
          </span>
        )}

        {/* Store badge (real products) */}
        {source && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
              borderRadius: "50px",
              padding: "0.25rem 0.65rem",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#2d1b69",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              maxWidth: "140px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <Store size={11} />
            {source}
          </div>
        )}

        {/* Legacy heat badge */}
        {!source && item.heat && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              borderRadius: "50px",
              padding: "0.25rem 0.65rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--fg-primary)",
            }}
          >
            {item.heat} {item.trending ? "Trending" : "Rising"}
          </div>
        )}

        {/* Category tag (legacy) */}
        {item.category && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(45,27,105,0.75)",
              backdropFilter: "blur(8px)",
              borderRadius: "50px",
              padding: "0.25rem 0.7rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "white",
              letterSpacing: "0.03em",
            }}
          >
            {item.category}
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "1rem 1.1rem 1.1rem", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Brand / source */}
        <div
          style={{
            fontSize: "0.73rem",
            color: "var(--fg-muted)",
            fontWeight: 500,
            marginBottom: "0.2rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {(item.brand as string | undefined) ?? source ?? "Shop"}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--fg-primary)",
            lineHeight: 1.35,
            marginBottom: "0.65rem",
          }}
        >
          {item.title}
        </h3>

        {/* Tags (legacy) */}
        {item.tags && item.tags.length > 0 && (
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.7rem",
                  color: "#9b59b6",
                  background: "rgba(201,184,245,0.2)",
                  border: "1px solid rgba(201,184,245,0.4)",
                  borderRadius: "50px",
                  padding: "0.15rem 0.55rem",
                  fontWeight: 500,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer: price + buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.75rem", gap: "0.5rem" }}>
          {/* Price */}
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--fg-primary)" }}>
            {typeof item.price === "string" ? item.price : `$${item.price}`}
          </span>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* Buy Now (real products) */}
            {buyLink && (
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "50px",
                  background: "linear-gradient(135deg, #9b59b6, #c9b8f5)",
                  color: "white",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.2s",
                }}
              >
                <ShoppingBag size={13} />
                Buy Now
                <ExternalLink size={10} />
              </a>
            )}

            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: liked ? "#e91e8c" : "var(--fg-muted)", fontWeight: 600, padding: 0 }}
            >
              <Heart size={15} fill={liked ? "#e91e8c" : "none"} stroke={liked ? "#e91e8c" : "currentColor"} />
              {likeCount > 0 ? formatCount(likeCount) : ""}
            </motion.button>

            {/* Save */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleSave}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: saved ? "#9b59b6" : "var(--fg-muted)", fontWeight: 600, padding: 0 }}
            >
              <Bookmark size={15} fill={saved ? "#9b59b6" : "none"} stroke={saved ? "#9b59b6" : "currentColor"} />
              {saveCount > 0 ? formatCount(saveCount) : ""}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
