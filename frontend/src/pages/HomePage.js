import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiPackage,
  FiLock,
  FiRotateCw,
  FiHeadphones,
  FiArrowRight,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { productService } from "../services/api";
import ProductCard from "../components/ProductCard";
import "./styles/HomePage.css";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Products");

  const categories = [
    "All Products",
    "Electronics",
    "Clothing",
    "Books",
    "Home",
    "Beauty",
  ];

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300?text=NOVA";
    if (url.startsWith("data:") || url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts({
          limit: 12,
          sort: "random",
        });
        setFeaturedProducts(response.data.products.slice(0, 6));
        setAllProducts(response.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?search=${searchQuery}`;
    }
  };

  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    alert(`Thank you! We'll send updates to ${email}`);
    setEmail("");
  };

  return (
    <div className="home-page">
      {/* Hero Section - Split Layout */}
      <section className="hero-section">
        <div className="hero-background" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-grid">
            {/* Left: Editorial Text Panel */}
            <div className="hero-text-panel">
              <div className="hero-eyebrow">NOVA</div>
              <h1>
                Curated Luxury
                <br />
                For The Modern
                <br />
                Lifestyle
              </h1>
              <p className="hero-description">
                Discover exceptional pieces crafted for discerning tastes. Each
                item tells a story of quality, elegance, and timeless design.
              </p>

              <form onSubmit={handleSearch} className="hero-search">
                <input
                  type="text"
                  placeholder="Search our collection"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <FiSearch size={18} />
                </button>
              </form>

              <div className="hero-cta">
                <Link to="/products">Explore Collection</Link>
              </div>
            </div>

            {/* Right: 2×2 Product Mosaic */}
            <div className="hero-product-mosaic">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className={`mosaic-item mosaic-item-${index + 1}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={getImageUrl(product.images?.[0]?.url)}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300?text=NOVA";
                    }}
                  />
                  <div className="mosaic-overlay">
                    <h4>{product.name}</h4>
                    <p>${product.price?.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Ghost NOVA Watermark */}
        <div className="hero-watermark">
          <div className="watermark-text">NOVA</div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <section className="marquee-section">
        <div className="marquee-container">
          <div className="marquee-content">
            {[
              "Free Shipping Over $100",
              "•",
              "30-Day Returns",
              "•",
              "Secure Payment",
              "•",
              "24/7 Support",
              "•",
              "Curated Collection",
              "•",
              "Premium Quality",
              "•",
            ].map((item, index) => (
              <span key={index} className="marquee-item">
                {item}
              </span>
            ))}
          </div>
          <div className="marquee-content">
            {[
              "Free Shipping Over $100",
              "•",
              "30-Day Returns",
              "•",
              "Secure Payment",
              "•",
              "24/7 Support",
              "•",
              "Curated Collection",
              "•",
              "Premium Quality",
              "•",
            ].map((item, index) => (
              <span key={`duplicate-${index}`} className="marquee-item">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="categories-container">
          <h3>Shop by Category</h3>
          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={
                  cat === "All Products"
                    ? "/products"
                    : `/products?category=${cat.toLowerCase()}`
                }
                className={`category-link ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className="category-text">{cat}</span>
                <div className="category-underline"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="featured-container">
          <h2>Featured Collection</h2>
          <p>Discover our handpicked selection of premium products</p>

          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="loading-card">
                  <div className="loading-image"></div>
                  <div className="loading-content">
                    <div className="loading-title"></div>
                    <div className="loading-price"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.slice(0, 6).map((product, index) => (
                <div
                  key={product._id}
                  className="product-card-wrapper"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link
                    to={`/products/${product._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <ProductCard product={product} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No products available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="benefit-card">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <FiPackage size={26} className="text-black" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">On orders over $100</p>
            </div>

            <div className="benefit-card p-8 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <FiLock size={26} className="text-black" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">100% secure transactions</p>
            </div>

            <div className="benefit-card p-8 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <FiRotateCw size={26} className="text-black" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600 text-sm">30-day return policy</p>
            </div>

            <div className="benefit-card p-8 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <FiHeadphones size={26} className="text-black" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">We're here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="trust-strip">
        <div className="trust-container">
          <div className="trust-logos">
            <div className="trust-logo">Secure Payment</div>
            <div className="trust-logo">Free Shipping</div>
            <div className="trust-logo">30-Day Returns</div>
            <div className="trust-logo">Premium Quality</div>
            <div className="trust-logo">24/7 Support</div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>
            Join our newsletter for exclusive access to new arrivals and special
            offers
          </p>
          <form onSubmit={handleNewsletterSignup} className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
