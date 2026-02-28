import type { Metadata } from "next";
import FeedPage from "@/components/FeedContent";

export const metadata: Metadata = {
  title: "Trending — STYLO",
  description: "Discover what's trending in fashion right now. Curated looks, brands, and styles updated in real-time.",
};

export default function Page() {
  return <FeedPage />;
}
