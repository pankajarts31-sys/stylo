"use client";

import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
// heic2any is imported dynamically to avoid SSR "window is not defined" errors
import FeedCard from "@/components/FeedCard";
import { getApiBase } from "@/lib/api";
import type { FeedItem } from "@/data/feedData";

const API = getApiBase();

interface VisualSearchProps {
  onClose: () => void;
  onResults?: (matches: FeedItem[], query: string) => void;
}

export default function VisualSearch({ onClose, onResults }: VisualSearchProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FeedItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  // Detect mobile device (phone/tablet) vs desktop/laptop
  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const narrowScreen = window.matchMedia("(max-width: 768px)").matches;
      const mobileUA = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile((hasTouch && narrowScreen) || mobileUA);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isHeic = (f: File) =>
    f.type === "image/heic" ||
    f.type === "image/heif" ||
    f.name.toLowerCase().endsWith(".heic") ||
    f.name.toLowerCase().endsWith(".heif");

  const convertHeicToJpeg = async (f: File) => {
    const heic2any = (await import("heic2any")).default;
    const blob = (await heic2any({ blob: f, toType: "image/jpeg", quality: 0.9 })) as Blob;
    const jpgName = f.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], jpgName, { type: "image/jpeg" });
  };

  const convertToJpeg = async (f: File) => {
    const objectUrl = URL.createObjectURL(f);
    try {
      const img = new Image();
      img.decoding = "async";
      const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image decode failed"));
      });
      img.src = objectUrl;
      const decoded = await loaded;

      const canvas = document.createElement("canvas");
      canvas.width = decoded.naturalWidth || decoded.width;
      canvas.height = decoded.naturalHeight || decoded.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(decoded, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Convert failed"))), "image/jpeg", 0.9);
      });

      const baseName = f.name.replace(/\.[^.]+$/, "");
      const safeName = baseName ? `${baseName}.jpg` : "upload.jpg";
      return new File([blob], safeName, { type: "image/jpeg" });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

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

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const processFile = async (f: File) => {
    let uploadFile = f;
    if (isHeic(f)) {
      try {
        uploadFile = await convertHeicToJpeg(f);
      } catch {
        setError("Could not convert HEIC image. Please upload a JPEG, PNG, or WebP file.");
        return;
      }
    }

    if (!supportedTypes.has(uploadFile.type)) {
      try {
        uploadFile = await convertToJpeg(uploadFile);
      } catch {
        setError("Unsupported image type. Please upload a JPEG, PNG, or WebP image.");
        return;
      }
    }

    setFile(uploadFile);
    // Revoke the old object URL to prevent memory leaks
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(uploadFile));
    setError(null);
    setResults([]);
    await searchVisual(uploadFile);
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

      if (onResults && data.matches?.length > 0) {
        onResults(data.matches, data.query ?? "visual search");
        onClose();
      } else {
        setResults(data.matches);
      }
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
            
            {/* Hidden file inputs */}
            <input ref={inputRef} type="file" accept="image/*,.heic,.heif" onChange={handleChange} style={{ display: "none" }} />
            {isMobile && (
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleChange}
                style={{ display: "none" }}
              />
            )}

            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={!isMobile && !preview ? () => inputRef.current?.click() : undefined}
              style={{
                border: `2px dashed ${dragActive ? "#9b59b6" : "rgba(155,89,182,0.3)"}`,
                borderRadius: "16px",
                background: dragActive ? "rgba(155,89,182,0.05)" : "rgba(255,255,255,0.5)",
                padding: preview ? "1rem" : "3rem 1rem",
                textAlign: "center",
                cursor: !isMobile && !preview ? "pointer" : "default",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: preview ? "row" : "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem"
              }}
            >
              {preview ? (
                <>
                  <div style={{ width: "80px", height: "80px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <p style={{ fontWeight: 500, color: "var(--fg-primary)", marginBottom: "0.25rem" }}>{file?.name}</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>
                      {isMobile ? "Tap below to replace" : "Click or drag a new image to replace"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                      style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "transparent", cursor: "pointer", color: "var(--fg-secondary)" }}
                      title="Upload from Device"
                    >
                      <Upload size={18} />
                    </button>
                    {isMobile && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openCamera(); }}
                        style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "transparent", cursor: "pointer", color: "var(--fg-secondary)" }}
                        title="Use Camera"
                      >
                        <Camera size={18} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(155,89,182,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b59b6", marginBottom: "0.5rem" }}>
                    {isMobile ? <ImageIcon size={28} /> : <Upload size={28} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--fg-primary)", fontSize: "1.05rem", marginBottom: "0.25rem" }}>
                      {isMobile ? "Find similar styles" : "Upload an image to find similar looks"}
                    </p>
                    <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", marginBottom: isMobile ? "1rem" : "0" }}>
                      {isMobile
                        ? "Upload an image or take a photo to search"
                        : "Drag & drop a photo, or click to browse"}
                    </p>

                    {/* MOBILE: Two distinct buttons */}
                    {isMobile && (
                      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.6rem 1.2rem",
                            borderRadius: "999px",
                            border: "1px solid rgba(155,89,182,0.25)",
                            background: "rgba(155,89,182,0.05)",
                            color: "var(--fg-primary)",
                            fontWeight: 500,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                          }}
                        >
                          <Upload size={18} className="text-purple" />
                          Upload from Device
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCamera();
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.6rem 1.2rem",
                            borderRadius: "999px",
                            border: "none",
                            background: "#9b59b6",
                            color: "white",
                            boxShadow: "0 4px 14px rgba(155,89,182,0.3)",
                            fontWeight: 500,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                          }}
                        >
                          <Camera size={18} />
                          Use Camera
                        </button>
                      </div>
                    )}
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
                <p>Analyzing style with Gemini AI and searching Google Shopping...</p>
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
