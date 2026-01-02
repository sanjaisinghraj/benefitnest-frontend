"use client";

import React, { useState, useEffect, useMemo } from "react";

interface MarketplaceSettings {
  // Header Settings
  show_header?: boolean;
  show_search_bar?: boolean;
  show_wallet?: boolean;
  show_cart?: boolean;
  show_wishlist?: boolean;
  show_notifications?: boolean;

  // Hero/Banner Settings
  show_hero_banner?: boolean;
  hero_banner_images?: string[];
  hero_headline?: string;
  hero_subheadline?: string;
  show_promotional_banners?: boolean;

  // Categories Settings
  show_categories?: boolean;
  categories_title?: string;
  enabled_categories?: string[];
  category_display_style?: "grid" | "slider" | "list";

  // Products Settings
  show_featured_products?: boolean;
  featured_products_title?: string;
  show_deal_of_month?: boolean;
  deal_countdown_enabled?: boolean;
  show_new_arrivals?: boolean;
  show_best_sellers?: boolean;
  show_weekly_discounts?: boolean;
  show_recently_viewed?: boolean;
  products_per_row?: number;

  // Vendors Settings
  show_vendors?: boolean;
  vendors_title?: string;

  // Wallet Settings
  initial_wallet_balance?: number;
  wallet_currency?: string;
  show_wallet_transactions?: boolean;

  // Footer Settings
  show_footer?: boolean;
  show_newsletter?: boolean;
  footer_links?: { title: string; url: string }[];

  // Styling
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  card_border_radius?: number;

  // General
  marketplace_enabled?: boolean;
  marketplace_title?: string;
}

interface MarketplacePageProps {
  settings: MarketplaceSettings;
  theme: any;
  companyName: string;
  onBack?: () => void;
  isPreview?: boolean;
}

// Sample data for the marketplace
const sampleCategories = [
  {
    id: 1,
    name: "Health & Wellness",
    icon: "🏥",
    itemCount: 156,
    color: "#10b981",
  },
  { id: 2, name: "Electronics", icon: "📱", itemCount: 89, color: "#3b82f6" },
  { id: 3, name: "Fashion", icon: "👕", itemCount: 234, color: "#ec4899" },
  {
    id: 4,
    name: "Home & Living",
    icon: "🏠",
    itemCount: 167,
    color: "#f59e0b",
  },
  { id: 5, name: "Gift Cards", icon: "🎁", itemCount: 45, color: "#8b5cf6" },
  { id: 6, name: "Travel", icon: "✈️", itemCount: 78, color: "#06b6d4" },
  {
    id: 7,
    name: "Food & Dining",
    icon: "🍽️",
    itemCount: 123,
    color: "#ef4444",
  },
  { id: 8, name: "Entertainment", icon: "🎬", itemCount: 67, color: "#6366f1" },
];

const sampleProducts = [
  {
    id: 1,
    name: "Premium Health Checkup",
    category: "Health & Wellness",
    price: 2500,
    originalPrice: 3500,
    discount: 28,
    rating: 4.8,
    reviews: 156,
    image: "🏥",
    vendor: "HealthFirst",
    inStock: true,
  },
  {
    id: 2,
    name: "Wireless Earbuds Pro",
    category: "Electronics",
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    rating: 4.5,
    reviews: 89,
    image: "🎧",
    vendor: "TechZone",
    inStock: true,
  },
  {
    id: 3,
    name: "Yoga Mat Premium",
    category: "Health & Wellness",
    price: 899,
    originalPrice: 1299,
    discount: 31,
    rating: 4.7,
    reviews: 234,
    image: "🧘",
    vendor: "FitLife",
    inStock: true,
  },
  {
    id: 4,
    name: "Amazon Gift Card",
    category: "Gift Cards",
    price: 1000,
    originalPrice: 1000,
    discount: 0,
    rating: 5.0,
    reviews: 567,
    image: "🎁",
    vendor: "Amazon",
    inStock: true,
  },
  {
    id: 5,
    name: "Smart Watch Series 5",
    category: "Electronics",
    price: 4999,
    originalPrice: 6999,
    discount: 29,
    rating: 4.6,
    reviews: 178,
    image: "⌚",
    vendor: "TechZone",
    inStock: true,
  },
  {
    id: 6,
    name: "Spa & Massage Package",
    category: "Health & Wellness",
    price: 1500,
    originalPrice: 2500,
    discount: 40,
    rating: 4.9,
    reviews: 89,
    image: "💆",
    vendor: "RelaxSpa",
    inStock: true,
  },
  {
    id: 7,
    name: "Movie Tickets (2)",
    category: "Entertainment",
    price: 500,
    originalPrice: 700,
    discount: 29,
    rating: 4.4,
    reviews: 345,
    image: "🎬",
    vendor: "CinePlex",
    inStock: true,
  },
  {
    id: 8,
    name: "Restaurant Voucher",
    category: "Food & Dining",
    price: 1000,
    originalPrice: 1200,
    discount: 17,
    rating: 4.3,
    reviews: 123,
    image: "🍽️",
    vendor: "FoodieHub",
    inStock: true,
  },
];

const sampleVendors = [
  { id: 1, name: "HealthFirst", logo: "🏥", rating: 4.8, products: 45 },
  { id: 2, name: "TechZone", logo: "📱", rating: 4.6, products: 89 },
  { id: 3, name: "FitLife", logo: "💪", rating: 4.7, products: 34 },
  { id: 4, name: "Amazon", logo: "📦", rating: 4.9, products: 156 },
  { id: 5, name: "RelaxSpa", logo: "💆", rating: 4.8, products: 23 },
  { id: 6, name: "CinePlex", logo: "🎬", rating: 4.5, products: 12 },
];

export default function MarketplacePage({
  settings,
  theme,
  companyName,
  onBack,
  isPreview = false,
}: MarketplacePageProps) {
  const [walletBalance, setWalletBalance] = useState(
    settings.initial_wallet_balance || 5000,
  );
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });

  // Countdown timer for deals
  useEffect(() => {
    if (!settings.deal_countdown_enabled) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.deal_countdown_enabled]);

  const primaryColor = settings.primary_color || theme.primary || "#6366f1";
  const secondaryColor =
    settings.secondary_color || theme.secondary || "#8b5cf6";
  const accentColor = settings.accent_color || "#f59e0b";
  const bgColor = settings.background_color || "#f8fafc";
  const borderRadius = settings.card_border_radius || 16;
  const currency = settings.wallet_currency || "₹";

  const filteredProducts = useMemo(() => {
    let products = sampleProducts;
    if (selectedCategory) {
      products = products.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return products;
  }, [selectedCategory, searchQuery]);

  const addToCart = (productId: number) => {
    if (!cartItems.includes(productId)) {
      setCartItems([...cartItems, productId]);
    }
  };

  const toggleWishlist = (productId: number) => {
    if (wishlistItems.includes(productId)) {
      setWishlistItems(wishlistItems.filter((id) => id !== productId));
    } else {
      setWishlistItems([...wishlistItems, productId]);
    }
  };

  // Product Card Component
  const ProductCard = ({
    product,
  }: {
    product: (typeof sampleProducts)[0];
  }) => (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: `${borderRadius}px`,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb",
        transition: "all 0.3s",
        cursor: "pointer",
      }}
    >
      {/* Product Image */}
      <div
        style={{
          height: isPreview ? "80px" : "140px",
          background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span style={{ fontSize: isPreview ? "32px" : "48px" }}>
          {product.image}
        </span>
        {product.discount > 0 && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              backgroundColor: "#ef4444",
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: isPreview ? "9px" : "11px",
              fontWeight: 700,
            }}
          >
            {product.discount}% OFF
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: isPreview ? "24px" : "32px",
            height: isPreview ? "24px" : "32px",
            borderRadius: "50%",
            backgroundColor: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            fontSize: isPreview ? "12px" : "16px",
          }}
        >
          {wishlistItems.includes(product.id) ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Product Info */}
      <div style={{ padding: isPreview ? "10px" : "16px" }}>
        <div
          style={{
            fontSize: isPreview ? "9px" : "11px",
            color: primaryColor,
            marginBottom: "4px",
            fontWeight: 600,
          }}
        >
          {product.category}
        </div>
        <h4
          style={{
            fontSize: isPreview ? "11px" : "14px",
            fontWeight: 600,
            color: "#111827",
            margin: "0 0 8px 0",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </h4>

        {/* Rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "8px",
          }}
        >
          <span
            style={{ color: "#f59e0b", fontSize: isPreview ? "10px" : "12px" }}
          >
            ★
          </span>
          <span
            style={{ fontSize: isPreview ? "10px" : "12px", color: "#6b7280" }}
          >
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: isPreview ? "13px" : "18px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            {currency}
            {product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <span
              style={{
                fontSize: isPreview ? "10px" : "13px",
                color: "#9ca3af",
                textDecoration: "line-through",
              }}
            >
              {currency}
              {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(product.id)}
          disabled={cartItems.includes(product.id)}
          style={{
            width: "100%",
            padding: isPreview ? "8px" : "12px",
            backgroundColor: cartItems.includes(product.id)
              ? "#d1d5db"
              : primaryColor,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: isPreview ? "10px" : "13px",
            fontWeight: 600,
            cursor: cartItems.includes(product.id) ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {cartItems.includes(product.id) ? "✓ Added" : "🛒 Add to Cart"}
        </button>
      </div>
    </div>
  );

  // Category Card Component
  const CategoryCard = ({
    category,
  }: {
    category: (typeof sampleCategories)[0];
  }) => (
    <div
      onClick={() =>
        setSelectedCategory(
          selectedCategory === category.name ? null : category.name,
        )
      }
      style={{
        backgroundColor:
          selectedCategory === category.name ? `${category.color}15` : "white",
        borderRadius: `${borderRadius}px`,
        padding: isPreview ? "12px" : "20px",
        textAlign: "center",
        cursor: "pointer",
        border: `2px solid ${selectedCategory === category.name ? category.color : "#e5e7eb"}`,
        transition: "all 0.3s",
      }}
    >
      <div
        style={{
          width: isPreview ? "40px" : "60px",
          height: isPreview ? "40px" : "60px",
          borderRadius: "50%",
          backgroundColor: `${category.color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 10px",
          fontSize: isPreview ? "20px" : "28px",
        }}
      >
        {category.icon}
      </div>
      <h4
        style={{
          fontSize: isPreview ? "10px" : "13px",
          fontWeight: 600,
          color: "#111827",
          margin: "0 0 4px 0",
        }}
      >
        {category.name}
      </h4>
      <span style={{ fontSize: isPreview ? "9px" : "11px", color: "#6b7280" }}>
        {category.itemCount} items
      </span>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: bgColor,
        fontFamily: theme.bodyFont || "Inter, sans-serif",
      }}
    >
      {/* Header */}
      {settings.show_header !== false && (
        <header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: isPreview ? "10px 16px" : "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            {/* Left: Logo & Back */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {onBack && (
                <button
                  onClick={onBack}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: isPreview ? "16px" : "20px",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  ←
                </button>
              )}
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: isPreview ? "32px" : "44px",
                    height: isPreview ? "32px" : "44px",
                    borderRadius: "10px",
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: isPreview ? "16px" : "20px",
                  }}
                >
                  🛍️
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: isPreview ? "14px" : "18px",
                      fontWeight: 700,
                      margin: 0,
                      color: "#111827",
                    }}
                  >
                    {settings.marketplace_title || "Employee Marketplace"}
                  </h1>
                  <p
                    style={{
                      fontSize: isPreview ? "10px" : "12px",
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    {companyName}
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Search */}
            {settings.show_search_bar !== false && (
              <div
                style={{
                  flex: 1,
                  maxWidth: "500px",
                  position: "relative",
                }}
              >
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: isPreview
                      ? "10px 16px 10px 36px"
                      : "14px 20px 14px 48px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: isPreview ? "12px" : "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: isPreview ? "12px" : "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: isPreview ? "14px" : "18px",
                  }}
                >
                  🔍
                </span>
              </div>
            )}

            {/* Right: Wallet, Cart, Wishlist */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isPreview ? "8px" : "16px",
              }}
            >
              {/* Wallet */}
              {settings.show_wallet !== false && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: isPreview ? "8px 12px" : "10px 16px",
                    backgroundColor: `${primaryColor}10`,
                    borderRadius: "10px",
                    border: `1px solid ${primaryColor}30`,
                  }}
                >
                  <span style={{ fontSize: isPreview ? "16px" : "20px" }}>
                    💰
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: isPreview ? "9px" : "10px",
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      Wallet
                    </div>
                    <div
                      style={{
                        fontSize: isPreview ? "12px" : "15px",
                        fontWeight: 700,
                        color: primaryColor,
                      }}
                    >
                      {currency}
                      {walletBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Wishlist */}
              {settings.show_wishlist !== false && (
                <button
                  style={{
                    position: "relative",
                    background: "none",
                    border: "none",
                    fontSize: isPreview ? "18px" : "24px",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  ❤️
                  {wishlistItems.length > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: 700,
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {wishlistItems.length}
                    </span>
                  )}
                </button>
              )}

              {/* Cart */}
              {settings.show_cart !== false && (
                <button
                  style={{
                    position: "relative",
                    background: "none",
                    border: "none",
                    fontSize: isPreview ? "18px" : "24px",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  🛒
                  {cartItems.length > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        backgroundColor: primaryColor,
                        color: "white",
                        fontSize: "10px",
                        fontWeight: 700,
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {cartItems.length}
                    </span>
                  )}
                </button>
              )}

              {/* Notifications */}
              {settings.show_notifications !== false && (
                <button
                  style={{
                    position: "relative",
                    background: "none",
                    border: "none",
                    fontSize: isPreview ? "18px" : "24px",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  🔔
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      backgroundColor: "#ef4444",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                    }}
                  />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Hero Banner */}
      {settings.show_hero_banner !== false && (
        <div
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            padding: isPreview ? "20px" : "40px 24px",
            color: "white",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: isPreview ? "18px" : "32px",
                fontWeight: 800,
                marginBottom: "10px",
              }}
            >
              {settings.hero_headline || "🎉 Special Employee Discounts!"}
            </h2>
            <p
              style={{
                fontSize: isPreview ? "12px" : "16px",
                opacity: 0.9,
                marginBottom: "16px",
              }}
            >
              {settings.hero_subheadline ||
                "Use your benefits wallet to get exclusive deals on top brands"}
            </p>
            <button
              style={{
                padding: isPreview ? "10px 20px" : "14px 32px",
                backgroundColor: "white",
                color: primaryColor,
                border: "none",
                borderRadius: "10px",
                fontSize: isPreview ? "12px" : "15px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Shop Now →
            </button>
          </div>
        </div>
      )}

      {/* Promotional Banners */}
      {settings.show_promotional_banners !== false && (
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: isPreview ? "16px" : "24px",
            display: "grid",
            gridTemplateColumns: isPreview ? "1fr" : "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {[
            {
              icon: "🚚",
              title: "Free Delivery",
              desc: "On orders above ₹500",
              color: "#10b981",
            },
            {
              icon: "💰",
              title: "Wallet Cashback",
              desc: "Up to 10% on all purchases",
              color: "#f59e0b",
            },
            {
              icon: "🎁",
              title: "Bundle Deals",
              desc: "Save more with combos",
              color: "#8b5cf6",
            },
          ].map((promo, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: isPreview ? "12px" : "16px",
                backgroundColor: "white",
                borderRadius: `${borderRadius}px`,
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  width: isPreview ? "36px" : "48px",
                  height: isPreview ? "36px" : "48px",
                  borderRadius: "10px",
                  backgroundColor: `${promo.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isPreview ? "18px" : "24px",
                }}
              >
                {promo.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: isPreview ? "12px" : "14px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {promo.title}
                </div>
                <div
                  style={{
                    fontSize: isPreview ? "10px" : "12px",
                    color: "#6b7280",
                  }}
                >
                  {promo.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: isPreview ? "0 16px 16px" : "0 24px 40px",
        }}
      >
        {/* Categories Section */}
        {settings.show_categories !== false && (
          <section style={{ marginBottom: isPreview ? "24px" : "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: isPreview ? "14px" : "20px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                }}
              >
                {settings.categories_title || "🏷️ Shop by Category"}
              </h3>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: primaryColor,
                  fontSize: isPreview ? "11px" : "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                See All →
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPreview
                  ? "repeat(4, 1fr)"
                  : "repeat(auto-fill, minmax(140px, 1fr))",
                gap: isPreview ? "8px" : "16px",
              }}
            >
              {sampleCategories.slice(0, isPreview ? 4 : 8).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        )}

        {/* Deal of the Month */}
        {settings.show_deal_of_month !== false && (
          <section
            style={{
              marginBottom: isPreview ? "24px" : "40px",
              padding: isPreview ? "16px" : "24px",
              background: `linear-gradient(135deg, ${accentColor}15, ${primaryColor}15)`,
              borderRadius: `${borderRadius}px`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h3
                style={{
                  fontSize: isPreview ? "14px" : "20px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🔥 Deal of the Month
              </h3>
              {settings.deal_countdown_enabled !== false && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: isPreview ? "10px" : "12px",
                      color: "#6b7280",
                    }}
                  >
                    Ends in:
                  </span>
                  {[
                    { value: countdown.hours, label: "Hrs" },
                    { value: countdown.minutes, label: "Min" },
                    { value: countdown.seconds, label: "Sec" },
                  ].map((time, i) => (
                    <React.Fragment key={i}>
                      <div
                        style={{
                          backgroundColor: "#111827",
                          color: "white",
                          padding: isPreview ? "4px 8px" : "8px 12px",
                          borderRadius: "6px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: isPreview ? "12px" : "16px",
                            fontWeight: 700,
                          }}
                        >
                          {String(time.value).padStart(2, "0")}
                        </div>
                        <div style={{ fontSize: "8px", opacity: 0.7 }}>
                          {time.label}
                        </div>
                      </div>
                      {i < 2 && (
                        <span style={{ fontWeight: 700, color: "#111827" }}>
                          :
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPreview
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(220px, 1fr))",
                gap: isPreview ? "8px" : "16px",
              }}
            >
              {filteredProducts
                .filter((p) => p.discount >= 25)
                .slice(0, isPreview ? 2 : 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </section>
        )}

        {/* Featured Products / New Arrivals */}
        {settings.show_featured_products !== false && (
          <section style={{ marginBottom: isPreview ? "24px" : "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: isPreview ? "14px" : "20px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                }}
              >
                {settings.featured_products_title || "⭐ Featured Products"}
              </h3>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: primaryColor,
                  fontSize: isPreview ? "11px" : "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View All →
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPreview
                  ? "repeat(2, 1fr)"
                  : `repeat(${settings.products_per_row || 4}, 1fr)`,
                gap: isPreview ? "8px" : "16px",
              }}
            >
              {filteredProducts
                .slice(0, isPreview ? 4 : settings.products_per_row || 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </section>
        )}

        {/* Top Vendors */}
        {settings.show_vendors !== false && (
          <section style={{ marginBottom: isPreview ? "24px" : "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: isPreview ? "14px" : "20px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                }}
              >
                {settings.vendors_title || "🏪 Top Vendors"}
              </h3>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: primaryColor,
                  fontSize: isPreview ? "11px" : "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                All Vendors →
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPreview
                  ? "repeat(3, 1fr)"
                  : "repeat(auto-fill, minmax(180px, 1fr))",
                gap: isPreview ? "8px" : "16px",
              }}
            >
              {sampleVendors.slice(0, isPreview ? 3 : 6).map((vendor) => (
                <div
                  key={vendor.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: `${borderRadius}px`,
                    padding: isPreview ? "12px" : "20px",
                    textAlign: "center",
                    border: "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    style={{
                      width: isPreview ? "40px" : "60px",
                      height: isPreview ? "40px" : "60px",
                      borderRadius: "50%",
                      backgroundColor: `${primaryColor}10`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                      fontSize: isPreview ? "20px" : "28px",
                    }}
                  >
                    {vendor.logo}
                  </div>
                  <h4
                    style={{
                      fontSize: isPreview ? "11px" : "14px",
                      fontWeight: 600,
                      color: "#111827",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {vendor.name}
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      fontSize: isPreview ? "10px" : "12px",
                      color: "#6b7280",
                    }}
                  >
                    <span style={{ color: "#f59e0b" }}>★</span>
                    {vendor.rating} • {vendor.products} products
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter */}
        {settings.show_newsletter !== false && (
          <section
            style={{
              padding: isPreview ? "20px" : "40px",
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              borderRadius: `${borderRadius}px`,
              textAlign: "center",
              color: "white",
              marginBottom: isPreview ? "24px" : "40px",
            }}
          >
            <h3
              style={{
                fontSize: isPreview ? "16px" : "24px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              📧 Subscribe for Exclusive Deals
            </h3>
            <p
              style={{
                fontSize: isPreview ? "11px" : "14px",
                opacity: 0.9,
                marginBottom: "20px",
              }}
            >
              Get notified about new products and special offers
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  padding: isPreview ? "10px 14px" : "14px 18px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: isPreview ? "12px" : "14px",
                  outline: "none",
                }}
              />
              <button
                style={{
                  padding: isPreview ? "10px 16px" : "14px 24px",
                  backgroundColor: "white",
                  color: primaryColor,
                  border: "none",
                  borderRadius: "10px",
                  fontSize: isPreview ? "12px" : "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Subscribe
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      {settings.show_footer !== false && (
        <footer
          style={{
            backgroundColor: "#111827",
            color: "white",
            padding: isPreview ? "20px" : "40px 24px",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: isPreview ? "1fr" : "repeat(4, 1fr)",
              gap: "24px",
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: isPreview ? "12px" : "14px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                {settings.marketplace_title || "Employee Marketplace"}
              </h4>
              <p
                style={{
                  fontSize: isPreview ? "10px" : "12px",
                  color: "#9ca3af",
                  lineHeight: 1.6,
                }}
              >
                Your exclusive employee benefits marketplace with special
                discounts and wallet-based shopping.
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontSize: isPreview ? "12px" : "14px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                Quick Links
              </h4>
              {["My Orders", "Wishlist", "Track Order", "Help Center"].map(
                (link, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: isPreview ? "10px" : "12px",
                      color: "#9ca3af",
                      marginBottom: "8px",
                      cursor: "pointer",
                    }}
                  >
                    {link}
                  </div>
                ),
              )}
            </div>
            <div>
              <h4
                style={{
                  fontSize: isPreview ? "12px" : "14px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                Categories
              </h4>
              {sampleCategories.slice(0, 4).map((cat, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: isPreview ? "10px" : "12px",
                    color: "#9ca3af",
                    marginBottom: "8px",
                    cursor: "pointer",
                  }}
                >
                  {cat.name}
                </div>
              ))}
            </div>
            <div>
              <h4
                style={{
                  fontSize: isPreview ? "12px" : "14px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                Contact
              </h4>
              <div
                style={{
                  fontSize: isPreview ? "10px" : "12px",
                  color: "#9ca3af",
                  marginBottom: "8px",
                }}
              >
                📧 support@marketplace.com
              </div>
              <div
                style={{
                  fontSize: isPreview ? "10px" : "12px",
                  color: "#9ca3af",
                  marginBottom: "8px",
                }}
              >
                📞 1800-123-4567
              </div>
            </div>
          </div>
          <div
            style={{
              maxWidth: "1400px",
              margin: "24px auto 0",
              paddingTop: "20px",
              borderTop: "1px solid #374151",
              textAlign: "center",
              fontSize: isPreview ? "9px" : "11px",
              color: "#6b7280",
            }}
          >
            © {new Date().getFullYear()} {companyName} Employee Marketplace.
            Powered by BenefitNest.
          </div>
        </footer>
      )}
    </div>
  );
}
