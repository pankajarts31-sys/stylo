"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronDown, ChevronUp, ExternalLink, Truck, Package } from "lucide-react";
import type { DealItem } from "@/data/dealsData";

interface DealCardProps {
  item: DealItem;
  index: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          fill={s <= Math.round(rating) ? "#f39c12" : "none"}
          stroke={s <= Math.round(rating) ? "#f39c12" : "rgba(201,184,245,0.4)"}
        />
      ))}
    </div>
  );
}

export default function DealCard({ item, index }: DealCardProps) {
  const [expanded, setExpanded] = useState(false);

  const sortedStores = [...item.stores].sort((a, b) => a.price - b.price);
  const bestPrice = sortedStores[0];
  const highestPrice = sortedStores[sortedStores.length - 1].price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="glass"
      style={{ borderRadius: "22px", overflow: "hidden" }}
    >
      {/* Image + badges */}
      <div
        style={{
          height: "180px",
          background: item.imageGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3.5rem",
          position: "relative",
        }}
      >
        <span role="img" aria-label={item.title}>{item.imageEmoji}</span>

        {item.isHotDeal && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "linear-gradient(135deg, #f093fb, #f5576c)",
              borderRadius: "50px",
              padding: "0.25rem 0.7rem",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "white",
              letterSpacing: "0.03em",
            }}
          >
            🔥 Hot Deal
          </div>
        )}

        {item.savingsPercent && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(39,174,96,0.9)",
              backdropFilter: "blur(6px)",
              borderRadius: "50px",
              padding: "0.25rem 0.7rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "white",
            }}
          >
            Up to {item.savingsPercent}% off
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "1.1rem 1.25rem 1.25rem" }}>
        {/* Brand + category */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {item.brand}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              color: "#9b59b6",
              background: "rgba(201,184,245,0.2)",
              border: "1px solid rgba(201,184,245,0.35)",
              borderRadius: "50px",
              padding: "0.15rem 0.55rem",
              fontWeight: 600,
            }}
          >
            {item.category}
          </span>
        </div>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "0.4rem", lineHeight: 1.3 }}>
          {item.title}
        </h3>

        <p style={{ fontSize: "0.825rem", color: "var(--fg-secondary)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
          {item.description}
        </p>

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.9rem" }}>
          <StarRating rating={item.rating} />
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f39c12" }}>{item.rating}</span>
          <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>
            ({item.reviewCount.toLocaleString()} reviews)
          </span>
        </div>

        {/* Best price highlight */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(39,174,96,0.1), rgba(39,174,96,0.05))",
            border: "1.5px solid rgba(39,174,96,0.25)",
            borderRadius: "14px",
            padding: "0.75rem 1rem",
            marginBottom: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.72rem", color: "#27ae60", fontWeight: 600, marginBottom: "0.15rem" }}>
              {bestPrice.storeLogo} Best price at {bestPrice.store}
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--fg-primary)" }}>
              ${bestPrice.price}
              <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--fg-muted)", marginLeft: "0.4rem" }}>
                vs ${highestPrice} elsewhere
              </span>
            </div>
          </div>
          <a
            href={bestPrice.url}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              background: "linear-gradient(135deg, #c9b8f5, #f5b8d8)",
              color: "#2d1b69",
              border: "none",
              borderRadius: "50px",
              padding: "0.5rem 1.1rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Buy now <ExternalLink size={12} />
          </a>
        </div>

        {/* Expand/collapse store comparison */}
        <button
          id={`deal-compare-${item.id}`}
          onClick={() => setExpanded((e) => !e)}
          style={{
            width: "100%",
            background: "transparent",
            border: "1.5px solid rgba(201,184,245,0.4)",
            borderRadius: "12px",
            padding: "0.6rem",
            cursor: "pointer",
            color: "var(--fg-secondary)",
            fontSize: "0.82rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Hide" : "Compare"} {item.stores.length} stores
        </button>

        {/* Store comparison table */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {sortedStores.map((store, i) => (
                  <div
                    key={store.store}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "12px",
                      background: i === 0
                        ? "rgba(39,174,96,0.08)"
                        : "rgba(255,255,255,0.4)",
                      border: i === 0
                        ? "1px solid rgba(39,174,96,0.2)"
                        : "1px solid rgba(201,184,245,0.2)",
                      opacity: store.inStock ? 1 : 0.55,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                      <span style={{ fontSize: "1rem" }}>{store.storeLogo}</span>
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--fg-primary)" }}>
                          {store.store}
                          {!store.inStock && (
                            <span style={{ marginLeft: "0.4rem", fontSize: "0.68rem", color: "#e74c3c", fontWeight: 500 }}>Out of stock</span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Truck size={10} />
                          {store.shippingDays <= 2 ? `${store.shippingDays}-day shipping` : `${store.shippingDays} days`}
                          {store.deal && (
                            <span style={{ color: "#27ae60", fontWeight: 600 }}>· {store.deal}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.97rem", fontWeight: 800, color: i === 0 ? "#27ae60" : "var(--fg-primary)" }}>
                        ${store.price}
                      </span>
                      {store.inStock && (
                        <a
                          href={store.url}
                          style={{
                            fontSize: "0.72rem",
                            color: "#9b59b6",
                            textDecoration: "none",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.2rem",
                          }}
                        >
                          Visit <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
