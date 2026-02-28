"use client";

import { motion } from "framer-motion";
import { Heart, Bookmark, Sparkles } from "lucide-react";
import { useState } from "react";
import type { FeedItem } from "@/data/feedData";

interface FeedCardProps {
  item: FeedItem;
  index: number;
}

export default function FeedCard({ item, index }: FeedCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [saveCount, setSaveCount] = useState(item.saves);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setSaved((v) => !v);
    setSaveCount((c) => (saved ? c - 1 : c + 1));
  };

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="glass"
      style={{ borderRadius: "20px", overflow: "hidden", cursor: "pointer" }}
    >
      {/* Image placeholder */}
      <div
        style={{
          height: "220px",
          background: item.imageGradient,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "4rem",
        }}
      >
        <span role="img" aria-label={item.title}>
          {item.imageEmoji}
        </span>

        {/* Heat badge */}
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
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {item.heat} {item.trending ? "Trending" : "Rising"}
        </div>

        {/* Category tag */}
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
      </div>

      {/* Card body */}
      <div style={{ padding: "1rem 1.1rem 1.1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--fg-muted)",
              fontWeight: 500,
              marginBottom: "0.2rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {item.brand}
          </div>
          <h3
            style={{
              fontSize: "0.97rem",
              fontWeight: 700,
              color: "var(--fg-primary)",
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </h3>
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: "0.35rem",
            flexWrap: "wrap",
            marginBottom: "0.85rem",
          }}
        >
          {item.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.72rem",
                color: "#9b59b6",
                background: "rgba(201,184,245,0.2)",
                border: "1px solid rgba(201,184,245,0.4)",
                borderRadius: "50px",
                padding: "0.15rem 0.6rem",
                fontWeight: 500,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer: price + interaction */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--fg-primary)" }}
          >
            ${item.price}
          </span>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.8rem",
                color: liked ? "#e91e8c" : "var(--fg-muted)",
                fontWeight: 600,
                padding: 0,
              }}
            >
              <Heart
                size={16}
                fill={liked ? "#e91e8c" : "none"}
                stroke={liked ? "#e91e8c" : "currentColor"}
              />
              {formatCount(likeCount)}
            </motion.button>

            {/* Save */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleSave}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.8rem",
                color: saved ? "#9b59b6" : "var(--fg-muted)",
                fontWeight: 600,
                padding: 0,
              }}
            >
              <Bookmark
                size={16}
                fill={saved ? "#9b59b6" : "none"}
                stroke={saved ? "#9b59b6" : "currentColor"}
              />
              {formatCount(saveCount)}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
