export interface StorePrice {
  store: string;
  storeLogo: string; // emoji placeholder
  price: number;
  currency: string;
  inStock: boolean;
  shippingDays: number;
  url: string;
  deal?: string; // e.g. "15% off", "Free shipping"
}

export interface DealItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  imageGradient: string;
  imageEmoji: string;
  rating: number; // 0–5
  reviewCount: number;
  stores: StorePrice[];
  tags: string[];
  isHotDeal: boolean;
  savingsPercent?: number; // max saving vs highest price
}

export type DealCategory =
  | "All"
  | "Dresses"
  | "Outerwear"
  | "Footwear"
  | "Bags"
  | "Streetwear"
  | "Accessories";

export const DEAL_CATEGORIES: DealCategory[] = [
  "All",
  "Dresses",
  "Outerwear",
  "Footwear",
  "Bags",
  "Streetwear",
  "Accessories",
];

const DEALS_DATA: DealItem[] = [
  {
    id: "d1",
    title: "Silk Wrap Midi Dress",
    brand: "Reformation",
    category: "Dresses",
    description:
      "A stunning fluid silk-feel wrap dress with a deep V-neck and tie-waist. Perfect for date nights and summer events.",
    imageGradient: "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
    imageEmoji: "👗",
    rating: 4.7,
    reviewCount: 2841,
    isHotDeal: true,
    savingsPercent: 32,
    tags: ["silk", "midi", "wrap", "elegant"],
    stores: [
      { store: "Reformation", storeLogo: "🌿", price: 198, currency: "USD", inStock: true, shippingDays: 3, url: "#", deal: "Free shipping" },
      { store: "Nordstrom", storeLogo: "🛍️", price: 218, currency: "USD", inStock: true, shippingDays: 2, url: "#" },
      { store: "ASOS", storeLogo: "🌐", price: 145, currency: "USD", inStock: true, shippingDays: 5, url: "#", deal: "32% off" },
      { store: "Net-a-Porter", storeLogo: "⚫", price: 220, currency: "USD", inStock: false, shippingDays: 4, url: "#" },
    ],
  },
  {
    id: "d2",
    title: "Oversized Puffer Jacket",
    brand: "Canada Goose",
    category: "Outerwear",
    description:
      "Iconic lightweight down puffer with a relaxed silhouette. Wind and water resistant for all-season wear.",
    imageGradient: "linear-gradient(135deg, #d4b896, #7f7053)",
    imageEmoji: "🧥",
    rating: 4.9,
    reviewCount: 5670,
    isHotDeal: false,
    savingsPercent: 18,
    tags: ["winter", "puffer", "designer", "warm"],
    stores: [
      { store: "Canada Goose", storeLogo: "🍁", price: 795, currency: "USD", inStock: true, shippingDays: 3, url: "#" },
      { store: "Farfetch", storeLogo: "✈️", price: 720, currency: "USD", inStock: true, shippingDays: 5, url: "#", deal: "9% off" },
      { store: "Saks Fifth", storeLogo: "🏬", price: 650, currency: "USD", inStock: true, shippingDays: 2, url: "#", deal: "18% off" },
      { store: "eBay", storeLogo: "🔵", price: 580, currency: "USD", inStock: true, shippingDays: 7, url: "#", deal: "Pre-loved" },
    ],
  },
  {
    id: "d3",
    title: "Platform Lug-Sole Boots",
    brand: "Dr. Martens",
    category: "Footwear",
    description:
      "Chunky platform boots with the classic Dr. Martens air-cushioned sole. Pairs with everything from mini skirts to wide-leg jeans.",
    imageGradient: "linear-gradient(135deg, #2d3436, #636e72)",
    imageEmoji: "👢",
    rating: 4.6,
    reviewCount: 8920,
    isHotDeal: true,
    savingsPercent: 25,
    tags: ["chunky", "platform", "edgy", "boots"],
    stores: [
      { store: "Dr. Martens", storeLogo: "🥾", price: 180, currency: "USD", inStock: true, shippingDays: 4, url: "#" },
      { store: "ASOS", storeLogo: "🌐", price: 155, currency: "USD", inStock: true, shippingDays: 3, url: "#", deal: "14% off" },
      { store: "Zappos", storeLogo: "👟", price: 135, currency: "USD", inStock: true, shippingDays: 1, url: "#", deal: "25% off + free ship" },
      { store: "Urban Outfitters", storeLogo: "🏙️", price: 170, currency: "USD", inStock: false, shippingDays: 5, url: "#" },
    ],
  },
  {
    id: "d4",
    title: "Mini Quilted Chain Bag",
    brand: "Coach",
    category: "Bags",
    description:
      "A compact crossbody with signature quilting and a gold chain strap. Fits your essentials in chic, compact style.",
    imageGradient: "linear-gradient(135deg, #f5d0b8, #e8946a)",
    imageEmoji: "👜",
    rating: 4.5,
    reviewCount: 3210,
    isHotDeal: true,
    savingsPercent: 40,
    tags: ["quilted", "chain", "crossbody", "mini"],
    stores: [
      { store: "Coach", storeLogo: "🏷️", price: 350, currency: "USD", inStock: true, shippingDays: 3, url: "#" },
      { store: "Nordstrom Rack", storeLogo: "🏪", price: 245, currency: "USD", inStock: true, shippingDays: 4, url: "#", deal: "30% off" },
      { store: "Poshmark", storeLogo: "💖", price: 210, currency: "USD", inStock: true, shippingDays: 6, url: "#", deal: "40% off" },
      { store: "Bloomingdale's", storeLogo: "🌸", price: 325, currency: "USD", inStock: true, shippingDays: 2, url: "#" },
    ],
  },
  {
    id: "d5",
    title: "Cargo Joggers",
    brand: "Nike",
    category: "Streetwear",
    description:
      "Relaxed-fit fleece joggers with utility pockets. The go-to for elevated athleisure and city streetwear.",
    imageGradient: "linear-gradient(135deg, #c2e9fb, #a1c4fd)",
    imageEmoji: "👖",
    rating: 4.4,
    reviewCount: 12400,
    isHotDeal: false,
    savingsPercent: 20,
    tags: ["cargo", "athletic", "streetwear", "comfort"],
    stores: [
      { store: "Nike", storeLogo: "✔️", price: 95, currency: "USD", inStock: true, shippingDays: 3, url: "#" },
      { store: "Foot Locker", storeLogo: "👟", price: 88, currency: "USD", inStock: true, shippingDays: 2, url: "#", deal: "7% off" },
      { store: "ASOS", storeLogo: "🌐", price: 76, currency: "USD", inStock: true, shippingDays: 4, url: "#", deal: "20% off" },
      { store: "Amazon", storeLogo: "📦", price: 82, currency: "USD", inStock: true, shippingDays: 1, url: "#", deal: "Prime" },
    ],
  },
  {
    id: "d6",
    title: "Gold Hoop Earrings Set",
    brand: "Mejuri",
    category: "Accessories",
    description:
      "A set of three 14K gold-vermeil hoops in graduating sizes. Stack them or wear solo — always a chic moment.",
    imageGradient: "linear-gradient(135deg, #f6d365, #fda085)",
    imageEmoji: "💛",
    rating: 4.8,
    reviewCount: 6780,
    isHotDeal: true,
    savingsPercent: 15,
    tags: ["gold", "hoops", "earrings", "minimalist"],
    stores: [
      { store: "Mejuri", storeLogo: "💎", price: 88, currency: "USD", inStock: true, shippingDays: 4, url: "#" },
      { store: "Shopbop", storeLogo: "🛒", price: 82, currency: "USD", inStock: true, shippingDays: 3, url: "#", deal: "7% off" },
      { store: "Etsy", storeLogo: "🌱", price: 75, currency: "USD", inStock: true, shippingDays: 8, url: "#", deal: "15% off" },
      { store: "Revolve", storeLogo: "🔄", price: 90, currency: "USD", inStock: false, shippingDays: 3, url: "#" },
    ],
  },
];

export default DEALS_DATA;
