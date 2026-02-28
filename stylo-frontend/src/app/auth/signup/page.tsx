"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { signup, isLoading, error, user, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const displayError = localError ?? error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    if (password !== confirm) {
      setLocalError("Passwords don't match.");
      return;
    }
    await signup(name, email, password);
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Strong"][strength];
  const strengthColor = ["", "#e74c3c", "#f39c12", "#3498db", "#27ae60", "#27ae60"][strength];

  return (
    <main
      style={{
        minHeight: "calc(100vh - 68px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="glass"
        style={{
          borderRadius: "28px",
          padding: "clamp(2rem, 5vw, 3rem)",
          width: "100%",
          maxWidth: "460px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #f5b8d8, #c9b8f5)",
              marginBottom: "1rem",
            }}
          >
            <Sparkles size={24} color="white" />
          </div>
          <h1
            className="font-display"
            style={{ fontSize: "1.8rem", color: "var(--fg-primary)", marginBottom: "0.4rem" }}
          >
            Join STYLO
          </h1>
          <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>
            Your fashion journey starts here
          </p>
        </div>

        {/* Error */}
        {displayError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={{
              background: "rgba(245, 100, 130, 0.12)",
              border: "1px solid rgba(245, 100, 130, 0.3)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              color: "#c0392b",
              marginBottom: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {displayError}
            <button
              onClick={() => { clearError(); setLocalError(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#c0392b" }}
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Form */}
        <form id="signup-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Name */}
          <div>
            <label
              htmlFor="signup-name"
              style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "0.4rem" }}
            >
              Full name
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)" }} />
              <input
                id="signup-name"
                type="text"
                className="input-glass"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
              style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "0.4rem" }}
            >
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)" }} />
              <input
                id="signup-email"
                type="email"
                className="input-glass"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
              style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "0.4rem" }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)" }} />
              <input
                id="signup-password"
                type={showPwd ? "text" : "password"}
                className="input-glass"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: "2.5rem", paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--fg-muted)",
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password Strength */}
            {password && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "0.3rem" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: "4px",
                        borderRadius: "4px",
                        background: i <= strength ? strengthColor : "rgba(201,184,245,0.25)",
                        transition: "background 0.3s ease",
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: "0.75rem", color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="signup-confirm"
              style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "0.4rem" }}
            >
              Confirm password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)" }} />
              <input
                id="signup-confirm"
                type={showPwd ? "text" : "password"}
                className="input-glass"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                style={{
                  paddingLeft: "2.5rem",
                  borderColor: confirm && confirm !== password ? "rgba(231,76,60,0.5)" : undefined,
                }}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            id="signup-submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            disabled={isLoading}
            style={{
              width: "100%",
              marginTop: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.95rem",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "wait" : "pointer",
            }}
          >
            {isLoading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTop: "2px solid var(--fg-primary)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                Creating account…
              </span>
            ) : (
              <>
                Create Account <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--fg-muted)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "#9b59b6", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
