"use client";

import { motion } from "framer-motion";
import { Heart, Bookmark, ShoppingBag, Store } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import type { FeedItem } from "@/data/feedData";

interface FeedCardProps {
  item: FeedItem;
  index: number;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function FeedCard({ item, index }: FeedCardProps) {
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
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        background: "white",
        boxShadow: hovered
          ? "0 16px 48px rgba(140,100,220,0.22)"
          : "0 2px 10px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.25s ease",
      }}
    >
      {/* ── Image ─────────────────────────────────── */}
      <div style={{ position: "relative", lineHeight: 0, background: "white" }}>
        {showImg ? (
          <Image
            src={thumbnail!}
            alt={item.title}
            width={400}
            height={0}
            sizes="(max-width: 500px) 100vw, (max-width: 768px) 50vw, 25vw"
            style={{ width: "100%", height: "auto", display: "block" }}
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div
            style={{
              paddingTop: "125%",
              background:
                (item.imageGradient as string | undefined) ??
                "linear-gradient(135deg, #c9b8f5, #f5b8d8)",
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
              top: 10,
              left: 10,
              background: "rgba(255,255,255,0.93)",
              backdropFilter: "blur(8px)",
              borderRadius: "50px",
              padding: "0.18rem 0.55rem",
              fontSize: "0.67rem",
              fontWeight: 700,
              color: "#2d1b69",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              maxWidth: 120,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            <Store size={10} />{source}
          </div>
        )}

        {/* Hover overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "10px",
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
                background: saved ? "#9b59b6" : "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: saveLoading ? "wait" : "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                opacity: saveLoading ? 0.6 : 1,
              }}
            >
              <Bookmark
                size={15}
                fill={saved ? "white" : "none"}
                stroke={saved ? "white" : "#9b59b6"}
              />
            </motion.button>
          </div>

          {/* Bottom: Buy + Like */}
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
                  padding: "0.38rem 0.85rem",
                  borderRadius: "50px",
                  background: "rgba(255,255,255,0.95)",
                  color: "#9b59b6",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                }}
              >
                <ShoppingBag size={12} />Buy
              </a>
            ) : <span />}

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              title="Like"
              style={{
                width: 36,
                height: 36,
                background: liked ? "rgba(233,30,140,0.9)" : "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}
            >
              <Heart
                size={15}
                fill={liked ? "white" : "none"}
                stroke={liked ? "white" : "#e91e8c"}
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Info strip ────────────────────────────── */}
      <div style={{ padding: "0.6rem 0.75rem 0.75rem", background: "white" }}>
        <div
          style={{
            fontSize: "0.66rem",
            color: "#9b59b6",
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
            fontSize: "0.87rem",
            fontWeight: 600,
            color: "#1a1a2e",
            lineHeight: 1.35,
            marginBottom: "0.35rem",
          }}
        >
          {item.title}
        </h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.97rem", fontWeight: 800, color: "#1a1a2e" }}>
            {item.price}
          </span>
          {likeCount > 0 && (
            <span
              style={{
                fontSize: "0.72rem",
                color: liked ? "#e91e8c" : "#999",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
              }}
            >
              <Heart
                size={11}
                fill={liked ? "#e91e8c" : "none"}
                stroke={liked ? "#e91e8c" : "#999"}
              />
              {formatCount(likeCount)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
