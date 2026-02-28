"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import FeedCard from "@/components/FeedCard";
import type { FeedItem } from "@/data/feedData";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface VisualSearchProps {
  onClose: () => void;
}

export default function VisualSearch({ onClose }: VisualSearchProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FeedItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setResults([]);
    await searchVisual(f);
  };

  const searchVisual = async (f: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", f);

      const res = await fetch(`${API}/api/search/visual`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Visual search failed.");

      setResults(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          background: "rgba(255, 255, 255, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(155, 89, 182, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Camera className="text-purple" size={20} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--fg-primary)" }}>Visual Search</h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--fg-secondary)", padding: "0.25rem" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? "#9b59b6" : "rgba(155,89,182,0.3)"}`,
                borderRadius: "16px",
                background: dragActive ? "rgba(155,89,182,0.05)" : "rgba(255,255,255,0.5)",
                padding: preview ? "1rem" : "3rem 1rem",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: preview ? "row" : "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem"
              }}
            >
              <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} style={{ display: "none" }} />
              
              {preview ? (
                <>
                  <div style={{ width: "80px", height: "80px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <p style={{ fontWeight: 500, color: "var(--fg-primary)", marginBottom: "0.25rem" }}>{file?.name}</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>Click or drag a new image to replace</p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(155,89,182,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b59b6", marginBottom: "0.5rem" }}>
                    <Upload size={28} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--fg-primary)", fontSize: "1.05rem", marginBottom: "0.25rem" }}>
                      Upload an image to find similar looks
                    </p>
                    <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>
                      Drag & drop a photo, or click to browse
                    </p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div style={{ padding: "0.75rem", borderRadius: "12px", background: "rgba(231, 76, 60, 0.1)", color: "#c0392b", fontSize: "0.9rem", textAlign: "center" }}>
                {error}
              </div>
            )}

            {/* Loading / Results Area */}
            {loading ? (
              <div style={{ padding: "3rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: "var(--fg-secondary)" }}>
                <Loader2 size={32} className="text-purple" style={{ animation: "spin 1s linear infinite" }} />
                <p>Analyzing style and finding matches using CLIP AI...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            ) : results.length > 0 ? (
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--fg-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ImageIcon size={18} className="text-purple" /> Top Matches
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  {results.slice(0, 3).map((item, i) => (
                    <div key={item.id} style={{ transform: "scale(0.95)", transformOrigin: "top left" }}>
                      <FeedCard item={item} index={i} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
