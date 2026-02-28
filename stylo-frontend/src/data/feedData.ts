// Mock trending fashion data — will be replaced by scraper/API in Module 4
// Unified feed item — supports both legacy MongoDB schema and live Google Shopping (SerpApi) schema
export interface FeedItem {
  id: string;
  title: string;
  // Legacy (MongoDB) fields — optional since new SerpApi data won't have them
  brand?: string;
  category?: string;
  tags?: string[];
  price: number | string;
  currency?: string;
  imageGradient?: string;
  imageEmoji?: string;
  likes?: number;
  saves?: number;
  trending?: boolean;
  heat?: "🔥" | "✦" | "💜" | "🌿";
  // New (SerpApi / Google Shopping) fields
  thumbnail?: string;    // Real product image URL
  source?: string;       // Store name e.g. "Zara USA"
  link?: string;         // Direct buy link
  similarity?: number;   // Confidence score (visual search)
}

export type FeedCategory =
  | "All"
  | "Dresses"
  | "Outerwear"
  | "Streetwear"
  | "Minimalist"
  | "Y2K"
  | "Cottagecore"
  | "Workwear";

export const CATEGORIES: FeedCategory[] = [
  "All",
  "Dresses",
  "Outerwear",
  "Streetwear",
  "Minimalist",
  "Y2K",
  "Cottagecore",
  "Workwear",
];

const FEED_DATA: FeedItem[] = [
  {
    id: "1",
    title: "Linen Midi Wrap Dress",
    brand: "& Other Stories",
    category: "Dresses",
    tags: ["summer", "elegant", "boho"],
    price: 89,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #ffecd2, #fcb69f)",
    imageEmoji: "👗",
    likes: 4821,
    saves: 1203,
    trending: true,
    heat: "🔥",
  },
  {
    id: "2",
    title: "Oversized Wool Trench",
    brand: "Totême",
    category: "Outerwear",
    tags: ["autumn", "classic", "editorial"],
    price: 395,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #d4b896, #a08060)",
    imageEmoji: "🧥",
    likes: 6340,
    saves: 2150,
    trending: true,
    heat: "🔥",
  },
  {
    id: "3",
    title: "Cargo Wide-Leg Trousers",
    brand: "Zara",
    category: "Streetwear",
    tags: ["casual", "Y2K", "trendy"],
    price: 49,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #c2e9fb, #a1c4fd)",
    imageEmoji: "👖",
    likes: 3205,
    saves: 890,
    trending: false,
    heat: "✦",
  },
  {
    id: "4",
    title: "Satin Slip Skirt",
    brand: "Reformation",
    category: "Minimalist",
    tags: ["silk", "evening", "chic"],
    price: 148,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
    imageEmoji: "👗",
    likes: 5120,
    saves: 1876,
    trending: true,
    heat: "💜",
  },
  {
    id: "5",
    title: "Micro Mini Plaid Skirt",
    brand: "Urban Outfitters",
    category: "Y2K",
    tags: ["Y2K", "playful", "retro"],
    price: 55,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    imageEmoji: "🩷",
    likes: 7890,
    saves: 3210,
    trending: true,
    heat: "🔥",
  },
  {
    id: "6",
    title: "Prairie Floral Blouse",
    brand: "Free People",
    category: "Cottagecore",
    tags: ["floral", "romantic", "spring"],
    price: 78,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #a8edea, #fed6e3)",
    imageEmoji: "🌸",
    likes: 2340,
    saves: 678,
    trending: false,
    heat: "🌿",
  },
  {
    id: "7",
    title: "Blazer Dress",
    brand: "COS",
    category: "Workwear",
    tags: ["office", "structured", "power"],
    price: 175,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #667eea, #764ba2)",
    imageEmoji: "💼",
    likes: 4500,
    saves: 1920,
    trending: true,
    heat: "✦",
  },
  {
    id: "8",
    title: "Barrel Jeans",
    brand: "Agolde",
    category: "Streetwear",
    tags: ["denim", "relaxed", "modern"],
    price: 228,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    imageEmoji: "👖",
    likes: 5670,
    saves: 2340,
    trending: true,
    heat: "🔥",
  },
  {
    id: "9",
    title: "Smocked Maxi Dress",
    brand: "Faithfull The Brand",
    category: "Cottagecore",
    tags: ["vacation", "boho", "flowy"],
    price: 265,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #ffeaa7, #dfe6e9)",
    imageEmoji: "🌼",
    likes: 3890,
    saves: 1450,
    trending: false,
    heat: "🌿",
  },
  {
    id: "10",
    title: "Leather Moto Jacket",
    brand: "AllSaints",
    category: "Outerwear",
    tags: ["edgy", "rock", "statement"],
    price: 379,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #2d3436, #636e72)",
    imageEmoji: "🤘",
    likes: 8120,
    saves: 3890,
    trending: true,
    heat: "🔥",
  },
  {
    id: "11",
    title: "Lace Trim Cami",
    brand: "Revolve",
    category: "Y2K",
    tags: ["delicate", "layering", "feminine"],
    price: 68,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #fbc2eb, #a6c1ee)",
    imageEmoji: "🎀",
    likes: 6230,
    saves: 2780,
    trending: true,
    heat: "💜",
  },
  {
    id: "12",
    title: "Ribbed Knit Set",
    brand: "Skims",
    category: "Minimalist",
    tags: ["cozy", "matching", "neutral"],
    price: 128,
    currency: "USD",
    imageGradient: "linear-gradient(135deg, #e2cfc4, #c8b8b0)",
    imageEmoji: "🧶",
    likes: 9450,
    saves: 4210,
    trending: true,
    heat: "🔥",
  },
];

export default FEED_DATA;
