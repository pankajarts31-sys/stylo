"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGender } from "@/context/GenderContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/stylist", label: "AI Stylist" },
  { href: "/feed", label: "Trending" },
  { href: "/deals", label: "Deals" },
  { href: "/saved", label: "Saved" },
  { href: "/collab", label: "Collab" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { gender, setGender } = useGender();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        id="main-navbar"
        className="glass-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "68px",
          padding: "0 1.5rem",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
            maxWidth: "1400px",
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
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #e83e8c, #a29bfe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={18} color="white" />
            </motion.div>
            <span
              className="font-display"
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#fce4ec",
              }}
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
                    padding: "0.45rem 1rem",
                    borderRadius: "50px",
                    fontSize: "0.88rem",
                    fontWeight: active ? 600 : 500,
                    color: active ? "white" : "#d1d5db",
                    background: active ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                >
                  {link.label}
                  {active && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "60%",
                        height: "2px",
                        background: "#e83e8c",
                        borderRadius: "2px",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Controls */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {/* Gender Switcher */}
            <div
              style={{
                display: "flex",
                borderRadius: "50px",
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
                background: "rgba(255,255,255,0.05)",
                padding: "3px",
              }}
            >
              <button
                onClick={() => setGender("men")}
                style={{
                  padding: "0.3rem 0.9rem",
                  fontSize: "0.75rem",
                  fontWeight: gender === "men" ? 700 : 500,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "50px",
                  background: gender === "men"
                    ? "linear-gradient(135deg, #38bdf8, #818cf8)"
                    : "transparent",
                  color: gender === "men" ? "white" : "#9ca3af",
                  transition: "all 0.2s ease",
                  boxShadow: gender === "men" ? "0 2px 10px rgba(56,189,248,0.3)" : "none",
                }}
              >
                Men
              </button>
              <button
                onClick={() => setGender("women")}
                style={{
                  padding: "0.3rem 0.9rem",
                  fontSize: "0.75rem",
                  fontWeight: gender === "women" ? 700 : 500,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "50px",
                  background: gender === "women"
                    ? "linear-gradient(135deg, #e83e8c, #d63384)"
                    : "transparent",
                  color: gender === "women" ? "white" : "#9ca3af",
                  transition: "all 0.2s ease",
                  boxShadow: gender === "women" ? "0 2px 10px rgba(232,62,140,0.3)" : "none",
                }}
              >
                Women
              </button>
            </div>

            {/* Auth */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              {user ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.35rem 0.9rem",
                      borderRadius: "50px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <User size={14} style={{ color: "#e83e8c" }} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#d1d5db" }}>
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
                      gap: "0.35rem",
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "50px",
                      padding: "0.35rem 0.9rem",
                      cursor: "pointer",
                      color: "#d1d5db",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                    }}
                  >
                    <LogOut size={13} />
                    Sign out
                  </motion.button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#d1d5db",
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        padding: "0.4rem 0.75rem",
                      }}
                    >
                      Log in
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: "0.5rem 1.25rem",
                        borderRadius: "50px",
                        background: "linear-gradient(135deg, #a29bfe, #e83e8c)",
                        color: "white",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(162,155,254,0.4)",
                      }}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              className="show-mobile"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#d1d5db",
              }}
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
                  color: pathname === link.href ? "#e83e8c" : "#d1d5db",
                  fontWeight: pathname === link.href ? 600 : 500,
                  background: pathname === link.href ? "rgba(232,62,140,0.1)" : "transparent",
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
