"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Mic, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VisualSearch from "./VisualSearch";

import type { FeedItem } from "@/data/feedData";

interface SpeechRecognitionResultEntry { transcript: string }
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultEntry;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResult };
}
interface SpeechRecognitionErrorEvent extends Event { error: string }

interface PremiumSearchBarProps {
  onSearch: (query: string) => void;
  onVisualResults?: (matches: FeedItem[], query: string) => void;
  style?: React.CSSProperties;
}

export default function PremiumSearchBar({ onSearch, onVisualResults, style }: PremiumSearchBarProps) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (value.trim()) {
       onSearch(value.trim());
    } 
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus();
    onSearch(""); // clear results
  };

  // Basic Web Speech API integration
  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    // @ts-expect-error — Speech Recognition is not in standard TS lib
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Prioritizing Indian English based on previous localization

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setValue(finalTranscript);
        onSearch(finalTranscript); // instantly update Feed or Deals logic
        setIsListening(false);
      } else {
        setValue(interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="glass-search"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          borderRadius: "50px",
          padding: "0.25rem 0.5rem",
          transition: "all 0.3s ease",
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
          zIndex: 40,
          ...style
        }}
      >
        <div style={{ marginLeft: "0.8rem", color: "#6b7280" }}>
          <Search size={18} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search fashion, brands, or describe a look..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            padding: "0.85rem 1rem",
            fontSize: "1rem",
            fontFamily: `"Inter", sans-serif`,
            color: "white",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginRight: "0.25rem" }}>
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                type="button"
                onClick={handleClear}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.5rem",
                  borderRadius: "50%",
                }}
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)", margin: "0 0.25rem" }} />

          {/* Voice Search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={toggleVoiceSearch}
            style={{
              background: isListening ? "rgba(233, 30, 140, 0.1)" : "transparent",
              border: "none",
              cursor: "pointer",
              color: isListening ? "#e91e8c" : "var(--fg-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.6rem",
              borderRadius: "50%",
              position: "relative",
            }}
          >
            {isListening && (
              <motion.div
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(233, 30, 140, 0.3)",
                }}
              />
            )}
            <Mic size={18} />
          </motion.button>

          {/* Visual Search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setVisualSearchOpen(true)}
            style={{
              background: "linear-gradient(135deg, #a29bfe, #e83e8c)",
              border: "none",
              cursor: "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.6rem",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(162, 155, 254, 0.4)",
            }}
          >
            <Camera size={18} />
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {visualSearchOpen && <VisualSearch onClose={() => setVisualSearchOpen(false)} onResults={onVisualResults} />}
      </AnimatePresence>
    </>
  );
}
