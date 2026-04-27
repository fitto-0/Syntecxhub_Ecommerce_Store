import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart, FiUser } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import "./styles/Navbar.css";
import "./styles/ProfileImage.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const cartCount = items.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await clearCart();
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="NOVA logo" className="logo-img" />
          </Link>

          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <li>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" onClick={() => setIsMenuOpen(false)}>
                Products
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
            </li>
          </ul>

          <div className="nav-actions">
            <Link to="/cart" className="cart-icon">
              <FiShoppingCart size={24} />
              {cartCount > 0 && <span className="">{cartCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="user-menu" ref={dropdownRef}>
                <button className="user-btn" onClick={toggleDropdown}>
                  {user?.profileImage ? (
                    <img
                      src={
                        user.profileImage.startsWith("http")
                          ? user.profileImage
                          : `http://localhost:5000${user.profileImage}`
                      }
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <FiUser size={24} />
                  )}
                </button>
                <div className={`dropdown ${isDropdownOpen ? "active" : ""}`}>
                  <p className="user-name">
                    {user?.firstName} {user?.lastName}
                  </p>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsDropdownOpen(false);
                      }}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDropdownOpen(false);
                    }}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDropdownOpen(false);
                    }}
                  >
                    Orders
                  </Link>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-primary btn-small">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline btn-small">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
