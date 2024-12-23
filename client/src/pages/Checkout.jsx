import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/Checkout.css"; // Add custom CSS

const Checkout = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      axios
        .get(`http://localhost:7000/users/${userId}`)
        .then((response) => setUser(response.data))
        .catch((error) => console.error("Error fetching user data:", error));
    } else {
      navigate("/login");
    }

    axios
      .get(`http://localhost:7000/products/${productId}`)
      .then((response) => setProduct(response.data))
      .catch((error) => console.error("Error fetching product data:", error));
  }, [productId, navigate]);

  // Handle payment initiation
  
  
  const handlePayment = async () => {
    if (!user || !product) {
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
        productIds: [productId],
        quantity: quantity,  // Ensure the quantity is passed here
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
            const verification = await axios.post("http://localhost:7000/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert(verification.data.success ? "Payment Successful!" : "Payment Verification Failed");
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
  
  

  const handleIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrease = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  // Ensure product is loaded before accessing its properties
  if (!user || !product) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // Price Details Calculation (single product checkout)
  const priceDetails = {
    price: product.productbeforediscount * quantity,
    discount: (product.productbeforediscount - product.productafterdiscount) * quantity,
    total: product.productafterdiscount * quantity,
    shipping: product.productshippingcharge * quantity, // Assuming shipping per item
  };

  const packagingFee = 99; // Assuming packaging fee
  const grandTotal = priceDetails.total + packagingFee + priceDetails.shipping;

  return (
    <div className="checkout-container container">
      <h1 className="checkout-title text-center">Checkout page</h1>

      {/* User Details Section */}
      <div className="card user-card shadow-lg mb-4">
        <div className="card-header bg-primary-gradient text-white">
          <h5>Shipping Details</h5>
        </div>
        <div className="card-body">
          <p><i className="fas fa-user-circle"></i> <strong>Name:</strong> {user.name}</p>
          <p><i className="fas fa-phone-alt"></i> <strong>Mobile:</strong> {user.mobile}</p>
          <p><i className="fas fa-map-marker-alt"></i> <strong>Address:</strong> {user.address}</p>
        </div>
      </div>

           {/* Product Details Section */}
           <div className="card product-card shadow-lg mb-4 product-detail">
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
            <p><strong>Product:</strong> {product.productname}</p>
            <p className="product-price"><strong>Price:</strong> ₹{product.productafterdiscount}</p>
            <div className="quantity-section">
              <label htmlFor="quantity" className="form-label"><strong>Quantity:</strong></label>
              <div className="quantity-controls mt-2 d-flex align-items-center">
                <button
                  className="btns btns-outline-secondary btn-sm"
                  onClick={handleDecrease}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  readOnly
                  className="form-control quantity-input mx-2 text-center"
                  style={{ width: "60px" }}
                />
                <button
                  className="btns btns-outline-secondary btn-sm"
                  onClick={handleIncrease}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Price Details Section */}
      <div className="price-summary card shadow-sm mt-4">
        <div className="card-header bg-primary text-white">
          <h5>Price Details</h5>
        </div>
        <div className="card-body">
          <p><strong>Price ({quantity} item):</strong> ₹{priceDetails.price}</p>
          <p><strong>Discount:</strong> -₹{priceDetails.discount}</p>
          <p><strong>Shipping Charges:</strong> ₹{priceDetails.shipping}</p>
          <p><strong>Secured Packaging Fee:</strong> ₹{packagingFee}</p>
          <hr />
          <p className="grand-total"><strong>Total Amount:</strong> ₹{grandTotal}</p>
          <p className="savings"><strong>You Save:</strong> ₹{priceDetails.discount} on this order</p>
          <button className="btn btn-primary btn-lg btn-block mt-3" onClick={handlePayment}>
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
