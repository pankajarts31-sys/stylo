"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Sparkles, TrendingUp, ShoppingBag, Zap, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: <Sparkles size={28} />,
    title: "AI Fashion Stylist",
    desc: "Chat with your personal AI stylist trained on thousands of looks. Get outfit ideas for any occasion.",
    href: "/stylist",
    gradient: "linear-gradient(135deg, #c9b8f5, #9b59b6)",
    accent: "#c9b8f5",
  },
  {
    icon: <TrendingUp size={28} />,
    title: "Trending Feed",
    desc: "Discover what's hot right now. Curated looks from across the fashion universe updated in real-time.",
    href: "/feed",
    gradient: "linear-gradient(135deg, #f5b8d8, #e91e8c)",
    accent: "#f5b8d8",
  },
  {
    icon: <ShoppingBag size={28} />,
    title: "Smart Deal Hunter",
    desc: "Find the same item across 20+ stores with price tracking, reviews, and quality scores.",
    href: "/deals",
    gradient: "linear-gradient(135deg, #b8f5e8, #1abc9c)",
    accent: "#b8f5e8",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 68px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 1.5rem 5rem",
      }}
    >
      {/* ── Hero ── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          textAlign: "center",
          paddingTop: "6rem",
          maxWidth: "780px",
          width: "100%",
        }}
      >
        <motion.div variants={itemVariants} style={{ marginBottom: "1.5rem" }}>
          <span
            className="glass"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1.1rem",
              borderRadius: "50px",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#9b59b6",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <Zap size={13} />
            Your Virtual Fashion Universe
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", lineHeight: 1.1, marginBottom: "1.5rem" }}
        >
          Style Has Never Been{" "}
          <em className="gradient-text" style={{ fontStyle: "italic" }}>
            This Smart
          </em>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          style={{
            fontSize: "1.15rem",
            color: "var(--fg-secondary)",
            lineHeight: 1.75,
            marginBottom: "2.5rem",
            maxWidth: "560px",
            margin: "0 auto 2.5rem",
          }}
        >
          STYLO combines AI outfit advice, trending fashion discovery, and cross-platform deal hunting
          into one beautifully curated experience.
        </motion.p>

        <motion.div
          variants={itemVariants}
          style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link href="/stylist">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "1rem",
                padding: "0.85rem 2.25rem",
              }}
            >
              <Sparkles size={18} />
              Meet Your Stylist
            </motion.button>
          </Link>
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "1rem",
                padding: "0.85rem 2.25rem",
              }}
            >
              Get Started Free
              <ArrowRight size={16} />
            </motion.button>
          </Link>
        </motion.div>

        {/* Subtle stat pills */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
            marginTop: "3.5rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "50K+", label: "Outfits styled" },
            { value: "20+", label: "Stores tracked" },
            { value: "AI", label: "Powered by Gemini" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass"
              style={{ padding: "0.6rem 1.4rem", borderRadius: "50px", textAlign: "center" }}
            >
              <div
                style={{ fontSize: "1.1rem", fontWeight: 700, color: "#9b59b6" }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: "0.1rem" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── Feature Cards ── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          maxWidth: "1100px",
          width: "100%",
          marginTop: "6rem",
        }}
      >
        {FEATURES.map((feat) => (
          <motion.div key={feat.title} variants={itemVariants}>
            <Link href={feat.href} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250 }}
                className="glass"
                style={{
                  borderRadius: "24px",
                  padding: "2rem",
                  cursor: "pointer",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: feat.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    marginBottom: "1.25rem",
                    boxShadow: `0 8px 20px ${feat.accent}60`,
                  }}
                >
                  {feat.icon}
                </div>
                <h2
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "var(--fg-primary)",
                    marginBottom: "0.65rem",
                  }}
                >
                  {feat.title}
                </h2>
                <p style={{ fontSize: "0.92rem", color: "var(--fg-secondary)", lineHeight: 1.65 }}>
                  {feat.desc}
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginTop: "1.25rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#9b59b6",
                  }}
                >
                  Explore <ArrowRight size={14} />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.section>
    </main>
  );
}
