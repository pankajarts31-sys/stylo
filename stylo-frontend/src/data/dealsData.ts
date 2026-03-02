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
    brand: "Sabyasachi",
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
      { store: "Myntra", storeLogo: "🌿", price: 15840, currency: "INR", inStock: true, shippingDays: 3, url: "#", deal: "Free shipping" },
      { store: "Ajio", storeLogo: "🛍️", price: 17440, currency: "INR", inStock: true, shippingDays: 2, url: "#" },
      { store: "Tata CLiQ", storeLogo: "🌐", price: 11600, currency: "INR", inStock: true, shippingDays: 5, url: "#", deal: "32% off" },
      { store: "Nykaa Fashion", storeLogo: "⚫", price: 17600, currency: "INR", inStock: false, shippingDays: 4, url: "#" },
    ],
  },
  {
    id: "d2",
    title: "Oversized Puffer Jacket",
    brand: "Superdry",
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
      { store: "Superdry India", storeLogo: "🍁", price: 63600, currency: "INR", inStock: true, shippingDays: 3, url: "#" },
      { store: "Flipkart", storeLogo: "✈️", price: 57600, currency: "INR", inStock: true, shippingDays: 5, url: "#", deal: "9% off" },
      { store: "Amazon India", storeLogo: "🏬", price: 52000, currency: "INR", inStock: true, shippingDays: 2, url: "#", deal: "18% off" },
      { store: "Meesho", storeLogo: "🔵", price: 46400, currency: "INR", inStock: true, shippingDays: 7, url: "#", deal: "Pre-loved" },
    ],
  },
  {
    id: "d3",
    title: "Platform Lug-Sole Boots",
    brand: "Puma",
    category: "Footwear",
    description:
      "Chunky platform boots with the classic air-cushioned sole. Pairs with everything from mini skirts to wide-leg jeans.",
    imageGradient: "linear-gradient(135deg, #2d3436, #636e72)",
    imageEmoji: "👢",
    rating: 4.6,
    reviewCount: 8920,
    isHotDeal: true,
    savingsPercent: 25,
    tags: ["chunky", "platform", "edgy", "boots"],
    stores: [
      { store: "Puma India", storeLogo: "🥾", price: 14400, currency: "INR", inStock: true, shippingDays: 4, url: "#" },
      { store: "Tata CLiQ", storeLogo: "🌐", price: 12400, currency: "INR", inStock: true, shippingDays: 3, url: "#", deal: "14% off" },
      { store: "Urbanic", storeLogo: "👟", price: 10800, currency: "INR", inStock: true, shippingDays: 1, url: "#", deal: "25% off + free ship" },
      { store: "H&M India", storeLogo: "🏙️", price: 13600, currency: "INR", inStock: false, shippingDays: 5, url: "#" },
    ],
  },
  {
    id: "d4",
    title: "Mini Quilted Chain Bag",
    brand: "Vero Moda",
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
      { store: "Vero Moda", storeLogo: "🏷️", price: 28000, currency: "INR", inStock: true, shippingDays: 3, url: "#" },
      { store: "Shoppers Stop", storeLogo: "🏪", price: 19600, currency: "INR", inStock: true, shippingDays: 4, url: "#", deal: "30% off" },
      { store: "Lifestyle", storeLogo: "💖", price: 16800, currency: "INR", inStock: true, shippingDays: 6, url: "#", deal: "40% off" },
      { store: "Pantaloons", storeLogo: "🌸", price: 26000, currency: "INR", inStock: true, shippingDays: 2, url: "#" },
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
      { store: "Nike India", storeLogo: "✔️", price: 7600, currency: "INR", inStock: true, shippingDays: 3, url: "#" },
      { store: "Adidas India", storeLogo: "👟", price: 7040, currency: "INR", inStock: true, shippingDays: 2, url: "#", deal: "7% off" },
      { store: "Tata CLiQ", storeLogo: "🌐", price: 6080, currency: "INR", inStock: true, shippingDays: 4, url: "#", deal: "20% off" },
      { store: "Amazon India", storeLogo: "📦", price: 6560, currency: "INR", inStock: true, shippingDays: 1, url: "#", deal: "Prime" },
    ],
  },
  {
    id: "d6",
    title: "Gold Hoop Earrings Set",
    brand: "Giva",
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
      { store: "Giva", storeLogo: "💎", price: 7040, currency: "INR", inStock: true, shippingDays: 4, url: "#" },
      { store: "CaratLane", storeLogo: "🛒", price: 6560, currency: "INR", inStock: true, shippingDays: 3, url: "#", deal: "7% off" },
      { store: "Etsy India", storeLogo: "🌱", price: 6000, currency: "INR", inStock: true, shippingDays: 8, url: "#", deal: "15% off" },
      { store: "Tanishq", storeLogo: "🔄", price: 7200, currency: "INR", inStock: false, shippingDays: 3, url: "#" },
    ],
  },
];

export default DEALS_DATA;
