import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/BestofMobiles.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap Icons

const Mobiles = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:7000/products");
        const data = response.data.data;

        const mobiles = data.filter(
          (product) => product.category?.name === "Mobiles"
        );
        setProducts(mobiles);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Function to handle adding product to wishlist
  const handleAddToWishlist = async (product) => {
    const userId = sessionStorage.getItem("userId"); // Get userId from sessionStorage

    // Check if user is logged in
    if (!userId) {
      // If not logged in, show alert and redirect to login page
      setAlert({
        type: "danger",
        visible: true,
        message: "Please login to add product to wishlist!!",
      });
      setTimeout(() => setAlert({ ...alert, visible: false }), 3000); // Hide alert after 3 seconds
      navigate("/login", { state: { from: "/wishlist" } }); // Redirect to login page
      return; // Exit the function early
    }

    try {
      console.log("Adding to wishlist:", { userId, productId: product._id }); // Log the payload

      // Make the API request to add the product to the wishlist
      const response = await axios.post(
        "http://localhost:7000/wishlist/add-to-wishlist",
        {
          userId,
          productId: product._id,
        }
      );

      console.log("Response:", response.data); // Log the response
      setAlert({
        message: response.data.message,
        type: "success",
        visible: true,
      });
      setTimeout(() => setAlert({ ...alert, visible: false }), 3000); // Hide alert after 3 seconds
    } catch (error) {
      // Log error response, if available
      console.error(
        "Error adding to wishlist:",
        error.response ? error.response.data : error.message
      );
      setAlert({
        message: error.response ? error.response.data.message : error.message,
        type: "danger",
        visible: true,
      });
      setTimeout(() => setAlert({ ...alert, visible: false }), 3000); // Hide alert after 3 seconds
    }
  };

  const handleProductClick = (product) => {
    navigate(
      `/products/${product.subcategory.name}/${product._id}/${product.productname}`
    );
  };

  if (loading) return <div>Loading...</div>;
  if (!products.length) return <div>No Mobiles found!</div>;

  return (
    <div className="mobiles-container">
      {/* Alert Display */}
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
          <i
            className={`bi ${
              alert.type === "success"
                ? "bi-check-circle-fill"
                : "bi-exclamation-triangle-fill"
            } me-2`}
          ></i>
          {alert.message}
        </div>
      )}

      <h3>Best of Mobiles</h3>
      <div className="mobiles-grid">
        {products.map((product) => (
          <div className="mobile-card" key={product._id}>
            <img
              src={`http://localhost:7000/uploads/${product.productimages[0]}`}
              alt={product.productname}
              className="mobile-image"
              onClick={() => handleProductClick(product)}
            />
            <i
              className="bi bi-heart-fill wishlist-ico"
              title="Add to Wishlist"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the product click event
                handleAddToWishlist(product);
              }}
            ></i>
            <div className="mobile-details">
              <h4 onClick={() => handleProductClick(product)}>
                {product.productname}{" "}
              </h4>
              <p>
                <strong>₹{product.productafterdiscount}</strong>
                <del>₹{product.productbeforediscount}</del>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mobiles;
