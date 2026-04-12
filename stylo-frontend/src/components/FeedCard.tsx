"use client";

import { motion } from "framer-motion";
import { Heart, Bookmark, ShoppingBag, Store } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { getApiBase } from "@/lib/api";
import type { FeedItem } from "@/data/feedData";

interface FeedCardProps {
  item: FeedItem;
  index: number;
  onSelect?: (item: FeedItem) => void;
}

const API = getApiBase();

export default function FeedCard({ item, index, onSelect }: FeedCardProps) {
  const [liked, setLiked]             = useState(false);
  const [saved, setSaved]             = useState(false);
  const [savedItemId, setSavedItemId] = useState<number | null>(null);
  const [likeCount, setLikeCount]     = useState(item.likes ?? 0);
  const [imgError, setImgError]       = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [hovered, setHovered]         = useState(false);

  const { user } = useAuth();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saveLoading) return;

    if (!user) {
      setSaved((v) => !v);
      return;
    }

    const token = localStorage.getItem("stylo_jwt");
    if (!token) return;

    setSaveLoading(true);
    const wasAlreadySaved = saved;
    setSaved(!wasAlreadySaved);

    try {
      if (!wasAlreadySaved) {
        const res = await fetch(`${API}/api/saved`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            product_url: item.link ?? "",
            image_url:   item.thumbnail ?? "",
            title:       item.title,
            price:       String(item.price ?? ""),
            source:      item.source ?? "Store",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSavedItemId(data.id ?? null);
        } else {
          setSaved(wasAlreadySaved);
        }
      } else {
        if (savedItemId !== null) {
          const res = await fetch(`${API}/api/saved/${savedItemId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) setSavedItemId(null);
          else setSaved(wasAlreadySaved);
        }
      }
    } catch {
      setSaved(wasAlreadySaved);
    } finally {
      setSaveLoading(false);
    }
  };

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const thumbnail = item.thumbnail;
  const source    = item.source;
  const buyLink   = item.link;
  const showImg   = Boolean(thumbnail) && !imgError;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(item)}
      className="glass-card"
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* ── Image ─────────────────────────────────── */}
      <div style={{ position: "relative", lineHeight: 0 }}>
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail!}
            alt={item.title}
            style={{ width: "100%", height: "auto", display: "block" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              paddingTop: "125%",
              background:
                (item.imageGradient as string | undefined) ??
                "linear-gradient(135deg, #a29bfe, #e83e8c)",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3.5rem",
              }}
            >
              {(item.imageEmoji as string | undefined) ?? "🛍️"}
            </span>
          </div>
        )}

        {/* Source badge */}
        {source && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(12px)",
              borderRadius: "6px",
              padding: "0.2rem 0.5rem",
              fontSize: "0.62rem",
              fontWeight: 700,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              maxWidth: 120,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Store size={9} />{source}
          </div>
        )}

        {/* Hover overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "12px",
          }}
        >
          {/* Top-right: Save */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleSave}
              disabled={saveLoading}
              title={user ? (saved ? "Remove from saved" : "Save") : "Login to save"}
              style={{
                width: 36,
                height: 36,
                background: saved ? "#e83e8c" : "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: saveLoading ? "wait" : "pointer",
                opacity: saveLoading ? 0.6 : 1,
              }}
            >
              <Bookmark
                size={15}
                fill={saved ? "white" : "none"}
                stroke="white"
              />
            </motion.button>
          </div>

          {/* Bottom: Quick Shop + Like */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {buyLink ? (
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  background: "white",
                  color: "black",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  transform: hovered ? "translateY(0)" : "translateY(8px)",
                  transition: "transform 0.25s ease",
                }}
              >
                <ShoppingBag size={12} />Quick Shop
              </a>
            ) : <span />}

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              title="Like"
              style={{
                width: 36,
                height: 36,
                background: liked ? "rgba(232,62,140,0.9)" : "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Heart
                size={15}
                fill={liked ? "white" : "none"}
                stroke="white"
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Info strip ────────────────────────────── */}
      <div style={{ padding: "0.65rem 0.75rem 0.75rem" }}>
        <div
          style={{
            fontSize: "0.64rem",
            color: "#e83e8c",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.2rem",
          }}
        >
          {(item.brand as string | undefined) ?? source ?? "Store"}
        </div>
        <h3
          className="line-clamp-2"
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "white",
            lineHeight: 1.35,
            marginBottom: "0.35rem",
          }}
        >
          {item.title}
        </h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "white" }}>
            {item.price}
          </span>
          {likeCount > 0 && (
            <span
              style={{
                fontSize: "0.72rem",
                color: liked ? "#e83e8c" : "#6b7280",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
              }}
            >
              <Heart
                size={11}
                fill={liked ? "#e83e8c" : "none"}
                stroke={liked ? "#e83e8c" : "#6b7280"}
              />
              {formatCount(likeCount)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
