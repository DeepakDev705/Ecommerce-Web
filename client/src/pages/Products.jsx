import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "react-bootstrap"; // Import Bootstrap Card component
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BiSort } from "react-icons/bi"; // Import the sort icon
import "../assets/Product.css";

const Products = () => {
  const { categoryId, subcategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ visible: false, message: "", type: "" });
  const [selectedSort, setSelectedSort] = useState(""); // Track the selected sort option
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/products?categoryId=${categoryId}&subcategoryId=${subcategoryId}`
        );

        if (response.data && response.data.data) {
          setProducts(response.data.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError("Error fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, subcategoryId]);

  const handleProductClick = (product) => {
    navigate(
      `/products/${product.subcategory.name}/${product._id}/${product.productname}`
    );
  };

  const handleAddToWishlist = async (product) => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      try {
        const response = await axios.post(
          "http://localhost:7000/wishlist/add-to-wishlist",
          {
            userId,
            productId: product._id,
          }
        );

        setAlert({
          visible: true,
          type: "success",
          message: response.data.message,
        });

        // Hide the alert after 3 seconds
        setTimeout(
          () => setAlert({ visible: false, message: "", type: "" }),
          3000
        );
      } catch (error) {
        setAlert({
          visible: true,
          type: "danger",
          message: "Product is already in Wishlist.",
        });

        // Hide the alert after 3 seconds
        setTimeout(
          () => setAlert({ visible: false, message: "", type: "" }),
          3000
        );
      }
    } else {
      navigate("/login", { state: { from: "/wishlist" } });
    }
  };

  const handleSortChange = (event) => {
    const sortOption = event.target.value;
    setSelectedSort(sortOption);

    let sortedProducts = [...products];
    switch (sortOption) {
      case "price-asc":
        sortedProducts.sort(
          (a, b) => a.productafterdiscount - b.productafterdiscount
        );
        break;
      case "price-desc":
        sortedProducts.sort(
          (a, b) => b.productafterdiscount - a.productafterdiscount
        );
        break;
      case "name-asc":
        sortedProducts.sort((a, b) =>
          a.productname.localeCompare(b.productname)
        );
        break;
      case "name-desc":
        sortedProducts.sort((a, b) =>
          b.productname.localeCompare(a.productname)
        );
        break;
      default:
        break;
    }
    setProducts(sortedProducts); // Update the sorted products
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-container">
      <h1 className="subcategory-title">
        {products.length > 0
          ? `${products[0].subcategory.name} Products`
          : "No products available"}
      </h1>

      <div className="d-flex justify-content-between align-items-center mb-4 sorting">
        <h4>All Products</h4>
        <div className="sort">
          <label htmlFor="sort-options" className="me-2 sort-label">
            <BiSort /> Sort By:
          </label>
          <select
            id="sort-options"
            value={selectedSort}
            onChange={handleSortChange}
            className="form-select"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">A to Z</option>
            <option value="name-desc">Z to A</option>
          </select>
        </div>
      </div>

      {/* Bootstrap Alert with animations */}
      {alert.visible && (
        <div
          className={`alert alert-${alert.type} alert-dismissible`}
          role="alert"
          style={{
            width: "30%",
            height: "50px",
            textAlign: "center",
            position: "fixed", // Ensures the alert is not fixed in place but still visible
            top: "12%", // Shows the alert 10% from the top of the screen
            left: "50%",
            transform: "translateX(-50%)", // Centers the alert horizontally
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Adds a soft shadow to the alert
            zIndex: 9999, // Ensures it's on top of other elements
            opacity: alert.visible ? 1 : 0,
            transition: "opacity 0.5s ease-in-out", // Smooth transition for alert visibility
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

      {products.length > 0 ? (
        <div className="row">
          {products.map((product) => (
            <div className="col-md-4" key={product._id}>
              <Card className="product-card mb-4">
                <div
                  className="position-relative"
                  onClick={() => handleProductClick(product)}
                >
                  <Card.Img
                    variant="top"
                    src={`http://localhost:7000/uploads/${product.productimages[0]}`}
                    alt={product.productname}
                    className="product-image"
                  />
                  <i
                    className="bi bi-heart-fill wishlist-icon"
                    title="Add to Wishlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(product);
                    }}
                  ></i>
                </div>
                <Card.Body className="product-body">
                  <h5
                    className="product-title"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.productname}
                  </h5>
                  <Card.Text
                    className="price-container"
                    onClick={() => handleProductClick(product)}
                  >
                    <span className="discounted-price">
                      ₹{product.productafterdiscount}
                    </span>
                    <span className="text-muted original-price">
                      ₹{product.productbeforediscount}
                    </span>
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <p>No products available.</p>
      )}
    </div>
  );
};

export default Products;
