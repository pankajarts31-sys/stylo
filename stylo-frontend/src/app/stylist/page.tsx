import type { Metadata } from "next";
import ChatWindow from "@/components/ChatWindow";

export const metadata: Metadata = {
  title: "AI Stylist — STYLO",
  description: "Chat with STYLO, your personal AI fashion stylist powered by Gemini.",
};

export default function StylistPage() {
  return <ChatWindow />;
}
