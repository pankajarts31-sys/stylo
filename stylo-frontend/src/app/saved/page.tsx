"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Sparkles, ExternalLink, Trash2 } from "lucide-react";
import Masonry from "react-masonry-css";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getApiBase } from "@/lib/api";

const API = getApiBase();

// Define the interface matching the backend Pydantic model response
interface SavedItem {
  id: number;
  user_id: number;
  product_url: string;
  image_url: string;
  title: string;
  price: string;
  source: string;
  created_at: string;
}

export default function SavedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("stylo_jwt");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error("Failed to fetch saved items", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("stylo_jwt");
    if (!token) return;

    // Optimistic UI update — save snapshot for rollback
    const snapshot = items.find((item) => item.id === id);
    setItems((current) => current.filter((item) => item.id !== id));

    try {
      const res = await fetch(`${API}/api/saved/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok && snapshot) {
        // Rollback on API failure
        setItems((current) => [...current, snapshot].sort((a, b) => a.id - b.id));
      }
    } catch (e) {
      console.error("Failed to delete saved item", e);
      if (snapshot) {
        setItems((current) => [...current, snapshot].sort((a, b) => a.id - b.id));
      }
    }
  };

  return (
    <main style={{ minHeight: "calc(100vh - 68px)", padding: "2.5rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <Bookmark size={22} style={{ color: "#9b59b6" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9b59b6", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              My Wishlist
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--fg-primary)", lineHeight: 1.2 }}>
            <span className="gradient-text">Saved</span> Looks & Items
          </h1>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--fg-muted)" }}>
             <p>Loading your saved looks...</p>
          </div>
        ) : !user ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--fg-muted)" }}>
             <Sparkles size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
             <p>Please log in to save and view your favorite fashion items.</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--fg-muted)" }}>
             <Bookmark size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
             <p>You haven&apos;t saved any items yet.</p>
             <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Find something you love on the Feed and click the heart icon!</p>
          </div>
        ) : (
          <Masonry breakpointCols={{ default: 4, 1100: 3, 768: 2, 500: 1 }} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
            <AnimatePresence mode="popLayout">
              {items.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                  className="glass"
                  style={{ borderRadius: "20px", overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  <div style={{ width: "100%", position: "relative", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      width={400}
                      height={0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                      unoptimized
                    />
                  </div>
                  
                  <div style={{ padding: "1rem 1.1rem" }}>
                    <div style={{ fontSize: "0.73rem", color: "var(--fg-muted)", fontWeight: 500, marginBottom: "0.4rem", textTransform: "uppercase" }}>
                      {item.source}
                    </div>
                    
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--fg-primary)", lineHeight: 1.35, marginBottom: "0.8rem" }}>
                      {item.title}
                    </h3>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--fg-primary)" }}>{item.price}</span>
                      
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => handleDelete(item.id)} style={{ background: "rgba(220,100,100,0.1)", border: "none", borderRadius: "50px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", color: "#e74c3c", cursor: "pointer" }}>
                          <Trash2 size={16} />
                        </button>
                        
                        <a href={item.product_url} target="_blank" rel="noopener noreferrer" style={{ padding: "0.4rem 0.8rem", borderRadius: "50px", background: "linear-gradient(135deg, #9b59b6, #c9b8f5)", color: "white", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          Buy <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </Masonry>
        )}
      </div>
    </main>
  );
}
