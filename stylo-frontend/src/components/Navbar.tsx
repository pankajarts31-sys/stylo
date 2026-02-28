"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/stylist", label: "AI Stylist" },
  { href: "/feed", label: "Trending" },
  { href: "/deals", label: "Deals" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        id="main-navbar"
        className="glass fixed top-0 left-0 right-0 z-50"
        style={{
          borderRadius: "0 0 20px 20px",
          borderTop: "none",
          padding: "0 2rem",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "68px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
            }}
          >
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles
                size={26}
                style={{
                  color: "#9b59b6",
                  filter: "drop-shadow(0 0 6px rgba(155,89,182,0.5))",
                }}
              />
            </motion.div>
            <span
              className="font-display gradient-text"
              style={{ fontSize: "1.5rem", letterSpacing: "0.05em" }}
            >
              STYLO
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div
            style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}
            className="hidden-mobile"
          >
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "0.5rem 1.1rem",
                    borderRadius: "50px",
                    fontSize: "0.9rem",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#9b59b6" : "var(--fg-secondary)",
                    background: active ? "rgba(201, 184, 245, 0.2)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    border: active ? "1px solid rgba(201,184,245,0.4)" : "1px solid transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Actions */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {user ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.4rem 1rem",
                    borderRadius: "50px",
                    background: "rgba(201,184,245,0.15)",
                    border: "1px solid rgba(201,184,245,0.3)",
                  }}
                >
                  <User size={15} style={{ color: "#9b59b6" }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--fg-secondary)" }}>
                    {user.full_name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "transparent",
                    border: "1.5px solid rgba(245,184,216,0.5)",
                    borderRadius: "50px",
                    padding: "0.45rem 1rem",
                    cursor: "pointer",
                    color: "var(--fg-secondary)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  <LogOut size={14} />
                  Sign out
                </motion.button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <button className="btn-ghost" style={{ fontSize: "0.875rem", padding: "0.5rem 1.4rem" }}>
                    Log in
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn-primary"
                    style={{ fontSize: "0.875rem", padding: "0.5rem 1.4rem" }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                display: "none",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--fg-secondary)",
              }}
              className="show-mobile"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="glass"
            style={{
              position: "fixed",
              top: "76px",
              left: "1rem",
              right: "1rem",
              zIndex: 49,
              borderRadius: "16px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  color: pathname === link.href ? "#9b59b6" : "var(--fg-secondary)",
                  fontWeight: pathname === link.href ? 600 : 500,
                  background: pathname === link.href ? "rgba(201,184,245,0.15)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
