import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/Checkout.css"; // Add custom CSS

const Checkout = () => {
  const [cartProducts, setCartProducts] = useState([]);
  const [user, setUser] = useState(null); // State for user data
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      navigate("/login", { state: { from: "/cart" } });
    } else {
      const fetchCartProducts = async () => {
        try {
          const response = await axios.get(
            `http://localhost:7000/cart/${userId}`
          );
          const cart = response.data.products.map((product) => ({
            ...product,
            quantity: 1,
          }));
          setCartProducts(cart);
        } catch (error) {
          alert("Failed to fetch cart details. Please try again.");
          console.error(error);
        }
      };

      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:7000/users/${userId}`
          );
          setUser(response.data); // Set the user data
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchCartProducts();
      fetchUserData();
    }
  }, [navigate]);

  // Handle quantity change for each product
  const handleQuantityChange = (productId, delta) => {
    setCartProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === productId
          ? { ...product, quantity: Math.max(1, product.quantity + delta) }
          : product
      )
    );
  };

  const handlePayment = async () => {
    if (!user || cartProducts.length === 0) {
      alert("User or Product details are missing.");
      return;
    }

    const amount = Math.round(grandTotal);
    const receipt = `receipt#${Date.now()}`;

    try {
      const order = await axios.post("http://localhost:7000/create-order", {
        amount,
        currency: "INR",
        receipt,
        userId: sessionStorage.getItem("userId"),
        productIds: cartProducts.map((product) => product._id), // Flatten array of product IDs
        quantity: cartProducts.reduce(
          (acc, product) => acc + product.quantity,
          0
        ), // Calculate total quantity
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY, // Securely fetch key
        amount: order.data.amount,
        currency: order.data.currency,
        name: "Ecommerce || Web",
        description: "Order Payment",
        order_id: order.data.orderId,
        handler: async function (response) {
          try {
            const verification = await axios.post(
              "http://localhost:7000/verify-payment",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
            );
            alert(
              verification.data.success
                ? "Payment Successful!"
                : "Payment Verification Failed"
            );
          } catch (error) {
            console.error("Payment verification failed:", error);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile,
        },
        theme: {
          color: "black",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Error initiating payment. Please try again.");
    }
  };

  if (!user || cartProducts.length === 0) {
    return <div className="loading-spinner">Loading...</div>;
  }

  const priceDetails = cartProducts.reduce(
    (acc, product) => {
      const itemTotal = product.productafterdiscount * product.quantity;
      const discount =
        (product.productbeforediscount - product.productafterdiscount) *
        product.quantity;
      acc.price += product.productbeforediscount * product.quantity;
      acc.discount += discount;
      acc.total += itemTotal;
      acc.shipping += product.productshippingcharge * product.quantity;
      return acc;
    },
    { price: 0, discount: 0, total: 0, shipping: 0 }
  );

  const packagingFee = 99;
  const grandTotal = priceDetails.total + packagingFee + priceDetails.shipping;

  if (cartProducts.length === 0) {
    return (
      <p className="text-center cart-empty">
        Your cart is empty. <a href="/">Start shopping now!</a>
      </p>
    );
  }

  return (
    <div className="checkout-container container">
      <h1 className="checkout-title text-center">Checkout Page</h1>

      {/* User Details Section */}
      <div className="card user-card shadow-lg mb-4">
        <div className="card-header bg-primary-gradient text-white">
          <h5>Shipping Details</h5>
        </div>
        <div className="card-body">
          <p>
            <i className="fas fa-user-circle"></i> <strong>Name:</strong>{" "}
            {user.name}
          </p>
          <p>
            <i className="fas fa-phone-alt"></i> <strong>Mobile:</strong>{" "}
            {user.mobile}
          </p>
          <p>
            <i className="fas fa-map-marker-alt"></i> <strong>Address:</strong>{" "}
            {user.address}
          </p>
        </div>
      </div>

      {/* Product Details Section */}
      {cartProducts.map((product, index) => (
        <div
          key={index}
          className="card product-card shadow-lg mb-4 product-detail"
        >
          <div className="card-headers bg-success-gradient text-white">
            <h5>Product Details</h5>
          </div>
          <div className="cards-body d-flex align-items-center">
            <img
              src={`http://localhost:7000/uploads/${product.productimages[0]}`}
              alt={product.productname}
              className="product-im mr-4"
            />
            <div>
              <p>
                <strong>Product:</strong> {product.productname}
              </p>
              <p className="product-price">
                <strong>Price:</strong> ₹{product.productafterdiscount}
              </p>
              <div className="quantity-section">
                <label htmlFor="quantity" className="form-label">
                  <strong>Quantity:</strong>
                </label>
                <div className="quantity-controls mt-2 d-flex align-items-center">
                  <button
                    className="btns btns-outline-secondary btn-sm"
                    onClick={() => handleQuantityChange(product._id, -1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={product.quantity}
                    readOnly
                    className="form-control quantity-input mx-2 text-center"
                    style={{ width: "60px" }}
                  />
                  <button
                    className="btns btns-outline-secondary btn-sm"
                    onClick={() => handleQuantityChange(product._id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Price Details Section */}
      <div className="price-summary card shadow-sm mt-4">
        <div className="card-header bg-primary text-white">
          <h5>Price Details</h5>
        </div>
        <div className="card-body">
          <p>
            <strong>Price ({cartProducts.length} items):</strong> ₹
            {priceDetails.price}
          </p>
          <p>
            <strong>Discount:</strong> -₹{priceDetails.discount}
          </p>
          <p>
            <strong>Shipping Charges:</strong> ₹{priceDetails.shipping}
          </p>
          <p>
            <strong>Secured Packaging Fee:</strong> ₹{packagingFee}
          </p>
          <hr />
          <p className="grand-total">
            <strong>Total Amount:</strong> ₹{grandTotal}
          </p>
          <p className="savings">
            <strong>You Save:</strong> ₹{priceDetails.discount} on this order
          </p>
          <button
            className="btn btn-primary btn-lg btn-block mt-3"
            onClick={handlePayment} // Trigger payment handler on button click
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
