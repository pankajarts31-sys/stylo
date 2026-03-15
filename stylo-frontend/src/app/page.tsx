"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Sparkles, TrendingUp, ShoppingBag, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: <Sparkles size={28} />,
    title: "AI Fashion Stylist",
    desc: "Chat with your personal AI stylist trained on thousands of looks. Get outfit ideas for any occasion.",
    href: "/stylist",
    gradient: "linear-gradient(135deg, #a29bfe, #6c5ce7)",
  },
  {
    icon: <TrendingUp size={28} />,
    title: "Trending Feed",
    desc: "Discover what's hot right now. Curated looks from across the fashion universe updated in real-time.",
    href: "/feed",
    gradient: "linear-gradient(135deg, #e83e8c, #ad1457)",
  },
  {
    icon: <ShoppingBag size={28} />,
    title: "Smart Deal Hunter",
    desc: "Find the same item across 20+ stores with price tracking, reviews, and quality scores.",
    href: "/deals",
    gradient: "linear-gradient(135deg, #ffa07a, #e83e8c)",
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Marquee Background ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          paddingTop: "5rem",
          paddingBottom: "5rem",
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", animation: "marquee 25s linear infinite" }}>
          <span className="marquee-text" style={{ paddingRight: "5rem" }}>
            SMART STYLE • TREND DISCOVERY • BEST DEALS • AI STYLIST •
          </span>
          <span className="marquee-text" style={{ paddingRight: "5rem" }}>
            SMART STYLE • TREND DISCOVERY • BEST DEALS • AI STYLIST •
          </span>
        </div>
        <div style={{ display: "flex", animation: "marquee-reverse 30s linear infinite" }}>
          <span className="marquee-text" style={{ paddingRight: "5rem" }}>
            AI OUTFIT ADVICE • VIRTUAL CLOSET • LUXURY FASHION •
          </span>
          <span className="marquee-text" style={{ paddingRight: "5rem" }}>
            AI OUTFIT ADVICE • VIRTUAL CLOSET • LUXURY FASHION •
          </span>
        </div>
        <div style={{ display: "flex", animation: "marquee 35s linear infinite" }}>
          <span className="marquee-text" style={{ paddingRight: "5rem" }}>
            YOUR PERSONAL STYLIST • 2025 TRENDS • SHOP THE LOOK •
          </span>
          <span className="marquee-text" style={{ paddingRight: "5rem" }}>
            YOUR PERSONAL STYLIST • 2025 TRENDS • SHOP THE LOOK •
          </span>
        </div>
      </div>

      {/* ── Hero ── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          textAlign: "center",
          paddingTop: "8rem",
          maxWidth: "850px",
          width: "100%",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Subtitle label */}
        <motion.div variants={itemVariants} style={{ marginBottom: "3rem" }}>
          <span
            className="glass"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "50px",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--brand-lavender)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "var(--brand-rose)" }}>✦</span>
            Your Virtual Fashion Universe
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: "2rem",
          }}
        >
          Style Has Never Been
          <br />
          <span
            className="font-display gradient-text text-glow"
            style={{
              fontStyle: "italic",
              display: "block",
              marginTop: "0.5rem",
            }}
          >
            This Smart
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          style={{
            maxWidth: "640px",
            margin: "0 auto 3rem",
            fontSize: "1.15rem",
            color: "#9ca3af",
            lineHeight: 1.75,
          }}
        >
          STYLO combines AI outfit advice, trending fashion discovery, and
          cross-platform deal hunting into one beautifully curated experience.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "5rem",
          }}
        >
          <Link href="/stylist">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <Sparkles size={20} />
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
              }}
            >
              Get Started Free
              <ArrowRight size={18} />
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating stat pills */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          {[
            { value: "50K+", label: "Outfits styled", delay: "0s" },
            { value: "20+", label: "Stores tracked", delay: "1s" },
            { value: "AI", label: "Powered by Gemini", delay: "2s" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass"
              style={{
                padding: "1.5rem",
                borderRadius: "2rem",
                textAlign: "center",
                animation: `float 6s ease-in-out infinite`,
                animationDelay: stat.delay,
              }}
            >
              <div style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                  color: "#6b7280",
                }}
              >
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
          position: "relative",
          zIndex: 10,
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
                    boxShadow: `0 8px 25px rgba(232, 62, 140, 0.3)`,
                  }}
                >
                  {feat.icon}
                </div>
                <h2
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "white",
                    marginBottom: "0.65rem",
                  }}
                >
                  {feat.title}
                </h2>
                <p style={{ fontSize: "0.92rem", color: "#9ca3af", lineHeight: 1.65 }}>
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
                    color: "var(--brand-lavender)",
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
