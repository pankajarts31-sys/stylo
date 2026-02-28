import type { Metadata } from "next";
import DealsContent from "@/components/DealsContent";

export const metadata: Metadata = {
  title: "Smart Deals — STYLO",
  description: "Find the best prices across 20+ stores. Real-time price comparison for fashion, footwear, bags, and accessories.",
};

export default function DealsPage() {
  return <DealsContent />;
}
