"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronDown, ChevronUp, ExternalLink, Truck, Crown, ShoppingBag } from "lucide-react";

interface StoreInfo {
  store: string;
  storeLogo: string;
  price: number;
  currency: string;
  inStock: boolean;
  shippingDays: number;
  url: string;
  deal?: string | null;
}

interface DealItemShape {
  id: string;
  title: string;
  brand: string;
  category: string;
  description?: string;
  imageGradient?: string;
  imageEmoji?: string;
  thumbnail?: string;
  rating: number;
  reviewCount: number;
  isHotDeal?: boolean;
  savingsPercent?: number;
  tags?: string[];
  stores: StoreInfo[];
}

interface DealCardProps {
  item: DealItemShape;
  index: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= Math.round(rating) ? "#f39c12" : "none"}
          stroke={s <= Math.round(rating) ? "#f39c12" : "#ddd"}
        />
      ))}
    </div>
  );
}

function StoreRow({ store, rank }: { store: StoreInfo; rank: number }) {
  const isBest = rank === 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.55rem 0.75rem",
        borderRadius: "10px",
        background: isBest ? "rgba(39,174,96,0.08)" : rank % 2 === 0 ? "#fafafa" : "white",
        border: isBest ? "1px solid rgba(39,174,96,0.22)" : "1px solid #f0f0f0",
        opacity: store.inStock ? 1 : 0.5,
        transition: "background 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "1rem", flexShrink: 0 }}>{store.storeLogo}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: "0.8rem", fontWeight: 600,
            color: isBest ? "#16a34a" : "#1a1a2e",
            display: "flex", alignItems: "center", gap: "0.3rem",
          }}>
            {isBest && <Crown size={10} color="#27ae60" />}
            {store.store}
            {!store.inStock && <span style={{ fontSize: "0.65rem", color: "#e74c3c" }}>· Out of stock</span>}
          </div>
          <div style={{ fontSize: "0.68rem", color: "#888", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Truck size={9} />
            {store.shippingDays <= 2 ? `${store.shippingDays}-day delivery` : `${store.shippingDays} days`}
            {store.deal && <span style={{ color: "#27ae60", fontWeight: 600 }}>· {store.deal}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
        <span style={{
          fontSize: "0.95rem", fontWeight: 800,
          color: isBest ? "#16a34a" : "#1a1a2e",
        }}>
          ₹{store.price.toLocaleString("en-IN")}
        </span>
        {store.inStock && store.url && store.url !== "#" ? (
          <a
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "0.2rem",
              padding: "0.28rem 0.65rem",
              borderRadius: "50px",
              background: isBest ? "#16a34a" : "rgba(155,89,182,0.08)",
              color: isBest ? "white" : "#9b59b6",
              fontSize: "0.7rem", fontWeight: 700, textDecoration: "none",
              border: isBest ? "none" : "1px solid rgba(155,89,182,0.3)",
            }}
          >
            {isBest ? <><ShoppingBag size={10} /> Buy</> : <><ExternalLink size={9} /> Visit</>}
          </a>
        ) : (
          <span style={{ fontSize: "0.65rem", color: "#e74c3c" }}>Unavailable</span>
        )}
      </div>
    </div>
  );
}

export default function DealCard({ item, index }: DealCardProps) {
  const [showAll, setShowAll] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Sort cheapest first, in-stock first
  const sortedStores = [...item.stores].sort((a, b) => {
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
    return a.price - b.price;
  });

  const topStores = sortedStores.slice(0, 4);
  const moreStores = sortedStores.slice(4);
  const bestPrice = sortedStores.find((s) => s.inStock) ?? sortedStores[0];
  const highestPrice = sortedStores.filter((s) => s.inStock).at(-1)?.price ?? bestPrice?.price ?? 0;
  const showThumbnail = item.thumbnail && !imgError;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.5), ease: [0.22, 1, 0.36, 1] }}
      style={{ borderRadius: "16px", overflow: "hidden", background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
    >
      {/* ── Product image ── */}
      <div style={{
        paddingTop: "60%", position: "relative", overflow: "hidden",
        background: item.imageGradient ?? "linear-gradient(135deg, #c9b8f5, #f5b8d8)",
      }}>
        {showThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            onError={() => setImgError(true)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem" }}>
            {item.imageEmoji ?? "🛍️"}
          </span>
        )}

        {/* Badges */}
        {item.isHotDeal && (
          <span style={{
            position: "absolute", top: 10, left: 10,
            background: "linear-gradient(135deg,#f093fb,#f5576c)",
            borderRadius: "50px", padding: "0.2rem 0.65rem",
            fontSize: "0.7rem", fontWeight: 700, color: "white",
          }}>🔥 Hot Deal</span>
        )}
        {(item.savingsPercent ?? 0) > 0 && (
          <span style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(22,163,74,0.92)", borderRadius: "50px",
            padding: "0.2rem 0.65rem", fontSize: "0.72rem", fontWeight: 700, color: "white",
          }}>Save {item.savingsPercent}%</span>
        )}
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: "0.9rem 1rem 1rem" }}>
        {/* Title + meta */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9b59b6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {item.brand}
          </span>
          <span style={{
            fontSize: "0.66rem", color: "#888",
            background: "rgba(201,184,245,0.15)", border: "1px solid rgba(201,184,245,0.3)",
            borderRadius: "50px", padding: "0.1rem 0.45rem", fontWeight: 500,
          }}>{item.category}</span>
        </div>

        <h3 style={{
          fontSize: "0.95rem", fontWeight: 700, color: "#1a1a2e",
          lineHeight: 1.3, marginBottom: "0.5rem",
        }}>{item.title}</h3>

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
          <StarRating rating={item.rating} />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f39c12" }}>{item.rating.toFixed(1)}</span>
          <span style={{ fontSize: "0.73rem", color: "#999" }}>({(item.reviewCount || 0).toLocaleString()})</span>
        </div>

        {/* ── Price summary bar ── */}
        {bestPrice && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0.6rem 0.8rem", borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(22,163,74,0.07), rgba(22,163,74,0.03))",
            border: "1.5px solid rgba(22,163,74,0.2)", marginBottom: "0.85rem",
          }}>
            <div>
              <div style={{ fontSize: "0.68rem", color: "#16a34a", fontWeight: 600 }}>
                {bestPrice.storeLogo} Best deal · {bestPrice.store}
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2 }}>
                ₹{bestPrice.price.toLocaleString("en-IN")}
                <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#999", marginLeft: "0.4rem" }}>
                  vs ₹{highestPrice.toLocaleString("en-IN")} max
                </span>
              </div>
            </div>
            <a
              href={bestPrice.url !== "#" ? bestPrice.url : undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: "0.3rem",
                background: "linear-gradient(135deg,#16a34a,#22c55e)",
                color: "white", borderRadius: "50px", padding: "0.45rem 1rem",
                fontSize: "0.8rem", fontWeight: 700, textDecoration: "none",
                boxShadow: "0 3px 8px rgba(22,163,74,0.35)",
              }}
            >
              <ShoppingBag size={13} /> Buy Now
            </a>
          </div>
        )}

        {/* ── Top 4 stores (always visible) ── */}
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
          Price across {sortedStores.length} stores
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {topStores.map((store, i) => (
            <StoreRow key={`${store.store}-top-${i}`} store={store} rank={i} />
          ))}
        </div>

        {/* ── More stores (collapsible) ── */}
        {moreStores.length > 0 && (
          <>
            <AnimatePresence>
              {showAll && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", paddingTop: "0.35rem" }}>
                    {moreStores.map((store, i) => (
                      <StoreRow key={`${store.store}-more-${i}`} store={store} rank={topStores.length + i} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowAll((s) => !s)}
              style={{
                width: "100%", marginTop: "0.6rem",
                background: "transparent", border: "1.5px solid rgba(201,184,245,0.4)",
                borderRadius: "10px", padding: "0.5rem",
                cursor: "pointer", color: "#9b59b6", fontSize: "0.78rem", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
              }}
            >
              {showAll ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showAll ? "Show less" : `+${moreStores.length} more stores`}
            </button>
          </>
        )}
      </div>
    </motion.article>
  );
}
