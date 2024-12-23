import React, { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaShoppingCart,
  FaSearch,
  FaSignInAlt,
  FaUserPlus,
  FaUser,
  FaClipboardList,
  FaHeart,
  FaSignOutAlt,
} from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/Header.css";
import axios from "axios";

const Header = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });
  const [cartQuantity, setCartQuantity] = useState(0);
  const navigate = useNavigate();

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const userId = sessionStorage.getItem("userId");
  const isLoggedIn = userId !== null;

  useEffect(() => {
    if (alert.visible) {
      const timer = setTimeout(() => setAlert({ ...alert, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Fetch cart quantity
  useEffect(() => {
    let interval;
    if (userId) {
      const fetchCartQuantity = async () => {
        try {
          const response = await axios.get(`http://localhost:7000/cart/${userId}`);
          const cartData = response.data;
          if (cartData && cartData.products) {
            setCartQuantity(cartData.products.length);
          }
        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
      };
  
      fetchCartQuantity();
  
      // Poll every 5 seconds
      interval = setInterval(fetchCartQuantity, 2000);
    }
  
    return () => clearInterval(interval); // Clear interval when component unmounts
  }, [userId]);
  
  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    navigate("/"); // Redirect to home page after logout
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setAlert({ message: "Please enter a search query.", type: "warning", visible: true });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:7000/searchproducts?search=${query.trim()}`
      );

      if (response.data && response.data.data.length > 0) {
        const firstProduct = response.data.data[0];
        const { category, subcategory } = firstProduct;
        navigate(`/products/${category._id}/${subcategory._id}`);
      } else {
        setAlert({ message: "No products found for your search query.", type: "warning", visible: true });
      }
    } catch (error) {
      setAlert({ message: "Something went wrong. Please try again later.", type: "danger", visible: true });
      console.error("Error fetching products:", error);
    }
  };

  return (
    <>
      {alert.visible && (
        <div
          className={`alert alert-${alert.type} alert-dismissible`}
          role="alert"
          style={{
            width: "30%",
            height: "50px",
            textAlign: "center",
            position: "fixed",
            top: "12%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            opacity: alert.visible ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
          aria-live="polite"
        >
          {alert.message}
        </div>
      )}

      <nav className="navbar navbar-expand-lg navbar-light shadow-sm fixed-top">
        <div className="container">
          <Link to="/" className="navbar-brand">
            Ecommerce | Web
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <form
              className="search-container d-flex me-auto my-2 my-lg-0"
              onSubmit={handleSearch}
            >
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for Products, Brands and More..."
                className="search-input form-control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>

            <ul className="navbar-nav ms-auto align-items-center">
              {!isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link nav-login">
                      <FaSignInAlt className="icon" /> Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/signup" className="nav-link nav-login">
                      <FaUserPlus className="icon" /> Signup
                    </Link>
                  </li>
                </>
              ) : (
                <li className="nav-item dropdown">
                  <div
                    className="nav-link login-dropdown"
                    onClick={toggleDropdown}
                  >
                    <FaUserCircle className="icon" />
                    <span>Menu</span>
                    <RiArrowDropDownLine
                      className={`dropdown-icon ${isDropdownOpen ? "open" : ""}`}
                    />
                  </div>
                  <ul
                    className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}
                  >
                    <li>
                      <Link to="/myprofile" className="dropdown-item">
                        <FaUser className="dropdown-icon-item" /> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders" className="dropdown-item">
                        <FaClipboardList className="dropdown-icon-item" /> Orders
                      </Link>
                    </li>
                    <li>
                      <Link to="/wishlist" className="dropdown-item">
                        <FaHeart className="dropdown-icon-item" /> Wishlist
                      </Link>
                    </li>
                    <li>
                      <div
                        className="dropdown-item logout"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="dropdown-icon-item" /> Logout
                      </div>
                    </li>
                  </ul>
                </li>
              )}

              <li className="nav-item">
                <div className="cart-product">{cartQuantity}</div>
                <Link to="/cart" className="nav-link nav-cart">
                  <FaShoppingCart className="icon" /> My Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
