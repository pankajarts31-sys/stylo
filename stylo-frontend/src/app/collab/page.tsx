"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Mail, Check, X, Trash2, Clock, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface CollaborationOut {
  id: number;
  inviter_id: number;
  invitee_email: string;
  invitee_id: number | null;
  status: string;
  created_at: string;
}

interface CollaboratorOut {
  collaboration_id: number;
  user_id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export default function CollabPage() {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const [received, setReceived] = useState<CollaborationOut[]>([]);
  const [sent, setSent] = useState<CollaborationOut[]>([]);
  const [collaborators, setCollaborators] = useState<CollaboratorOut[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeader = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("stylo_jwt");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [recRes, sentRes, collabRes] = await Promise.all([
        fetch(`${API}/api/collab/invites/received`, { headers: authHeader() }),
        fetch(`${API}/api/collab/invites/sent`, { headers: authHeader() }),
        fetch(`${API}/api/collab/collaborators`, { headers: authHeader() }),
      ]);
      if (recRes.ok) setReceived(await recRes.json());
      if (sentRes.ok) setSent(await sentRes.json());
      if (collabRes.ok) setCollaborators(await collabRes.json());
    } catch (e) {
      console.error("Failed to fetch collab data", e);
    } finally {
      setLoading(false);
    }
  }, [user, authHeader]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await fetch(`${API}/api/collab/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (res.ok) {
        setInviteSuccess(`Invite sent to ${inviteEmail.trim()}!`);
        setInviteEmail("");
        fetchData();
      } else {
        const data = await res.json();
        setInviteError(data.detail ?? "Failed to send invite.");
      }
    } catch {
      setInviteError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (inviteId: number) => {
    try {
      const res = await fetch(`${API}/api/collab/invite/${inviteId}/accept`, {
        method: "POST",
        headers: authHeader(),
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error("Failed to accept invite", e);
    }
  };

  const handleReject = async (inviteId: number) => {
    try {
      const res = await fetch(`${API}/api/collab/invite/${inviteId}/reject`, {
        method: "POST",
        headers: authHeader(),
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error("Failed to reject invite", e);
    }
  };

  const handleRemove = async (collaborationId: number) => {
    try {
      const res = await fetch(`${API}/api/collab/collaborators/${collaborationId}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (res.ok) setCollaborators((c) => c.filter((x) => x.collaboration_id !== collaborationId));
    } catch (e) {
      console.error("Failed to remove collaborator", e);
    }
  };

  if (!user && !loading) {
    return (
      <main style={{ minHeight: "calc(100vh - 68px)", padding: "2.5rem 1.5rem 5rem" }}>
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--fg-muted)" }}>
          <Sparkles size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <p>Please log in to manage your collaborators.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "calc(100vh - 68px)", padding: "2.5rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <Users size={22} style={{ color: "#e83e8c" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e83e8c", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Collaborate
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--fg-primary)", lineHeight: 1.2 }}>
            <span className="gradient-text">Invite</span> Collaborators
          </h1>
          <p style={{ color: "var(--fg-muted)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            Invite friends or teammates to collaborate on your fashion picks.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--fg-muted)" }}>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Send Invite Form */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass"
              style={{ borderRadius: "20px", padding: "1.75rem", marginBottom: "2rem" }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UserPlus size={18} style={{ color: "#e83e8c" }} />
                Send an Invite
              </h2>
              <form onSubmit={handleSendInvite} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <input
                  type="email"
                  placeholder="Enter collaborator's email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    minWidth: "220px",
                    padding: "0.65rem 1rem",
                    borderRadius: "50px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--fg-primary)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: "0.65rem 1.5rem",
                    borderRadius: "50px",
                    background: "linear-gradient(135deg, #a29bfe, #e83e8c)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    border: "none",
                    cursor: sending ? "not-allowed" : "pointer",
                    opacity: sending ? 0.7 : 1,
                  }}
                >
                  {sending ? "Sending…" : "Send Invite"}
                </motion.button>
              </form>

              <AnimatePresence>
                {inviteError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.75rem" }}
                  >
                    {inviteError}
                  </motion.p>
                )}
                {inviteSuccess && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ color: "#2ecc71", fontSize: "0.85rem", marginTop: "0.75rem" }}
                  >
                    {inviteSuccess}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Received Invites */}
            {received.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass"
                style={{ borderRadius: "20px", padding: "1.75rem", marginBottom: "2rem" }}
              >
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Mail size={18} style={{ color: "#a29bfe" }} />
                  Pending Invites ({received.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {received.map((inv) => (
                    <div
                      key={inv.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.85rem 1.1rem",
                        borderRadius: "14px",
                        background: "rgba(162,155,254,0.08)",
                        border: "1px solid rgba(162,155,254,0.15)",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "0.9rem", color: "var(--fg-primary)" }}>
                        Invite from <strong>ID #{inv.inviter_id}</strong>
                      </span>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <motion.button
                          whileHover={{ scale: 1.07 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAccept(inv.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.3rem",
                            padding: "0.45rem 0.9rem", borderRadius: "50px",
                            background: "rgba(46,204,113,0.15)", border: "1px solid rgba(46,204,113,0.3)",
                            color: "#2ecc71", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                          }}
                        >
                          <Check size={14} /> Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.07 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(inv.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.3rem",
                            padding: "0.45rem 0.9rem", borderRadius: "50px",
                            background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.25)",
                            color: "#e74c3c", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                          }}
                        >
                          <X size={14} /> Decline
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Active Collaborators */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass"
              style={{ borderRadius: "20px", padding: "1.75rem", marginBottom: "2rem" }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={18} style={{ color: "#e83e8c" }} />
                Collaborators ({collaborators.length})
              </h2>
              {collaborators.length === 0 ? (
                <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>
                  No collaborators yet. Send an invite above to get started!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <AnimatePresence>
                    {collaborators.map((c) => (
                      <motion.div
                        key={c.collaboration_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.85rem 1.1rem",
                          borderRadius: "14px",
                          background: "rgba(232,62,140,0.07)",
                          border: "1px solid rgba(232,62,140,0.15)",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #a29bfe, #e83e8c)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.95rem", fontWeight: 700, color: "white", flexShrink: 0,
                          }}>
                            {c.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--fg-primary)", margin: 0 }}>
                              {c.full_name}
                            </p>
                            <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", margin: 0 }}>
                              {c.email}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.07 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemove(c.collaboration_id)}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.3rem",
                            padding: "0.4rem 0.8rem", borderRadius: "50px",
                            background: "rgba(231,76,60,0.1)", border: "none",
                            color: "#e74c3c", fontSize: "0.8rem", cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} /> Remove
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.section>

            {/* Sent Invites (pending) */}
            {sent.filter((s) => s.status === "pending").length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass"
                style={{ borderRadius: "20px", padding: "1.75rem" }}
              >
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={18} style={{ color: "#fdcb6e" }} />
                  Sent Invites (Awaiting Response)
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {sent.filter((s) => s.status === "pending").map((inv) => (
                    <div
                      key={inv.id}
                      style={{
                        padding: "0.75rem 1.1rem",
                        borderRadius: "12px",
                        background: "rgba(253,203,110,0.08)",
                        border: "1px solid rgba(253,203,110,0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.88rem",
                        color: "var(--fg-muted)",
                      }}
                    >
                      <Clock size={13} style={{ color: "#fdcb6e", flexShrink: 0 }} />
                      <span>Waiting for <strong style={{ color: "var(--fg-primary)" }}>{inv.invitee_email}</strong> to accept</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
