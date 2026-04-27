import React from "react";
import { Link } from "react-router-dom";
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";
import "./styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>NOVA</h3>
          <p>
            Curated luxury for the modern lifestyle. Discover exceptional pieces
            crafted for discerning tastes.
          </p>
          <div className="social-links">
            <a href="#/" aria-label="Facebook">
              <FiFacebook />
            </a>
            <a href="#/" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="#/" aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="#/" aria-label="LinkedIn">
              <FiLinkedin />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Collection</h3>
          <ul>
            <li>
              <Link to="/products">All Products</Link>
            </li>
            <li>
              <Link to="/products?category=Electronics">Electronics</Link>
            </li>
            <li>
              <Link to="/products?category=Clothing">Clothing</Link>
            </li>
            <li>
              <Link to="/products?category=Home">Home & Living</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Support</h3>
          <ul>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/shipping">Shipping</Link>
            </li>
            <li>
              <Link to="/returns">Returns</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} NOVA. All rights reserved.</p>
        <div className="footer-links">
          <a href="#/">Privacy</a>
          <a href="#/">Terms</a>
          <a href="#/">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
