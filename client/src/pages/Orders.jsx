import React, { useEffect, useState } from "react";
import axios from "axios";
import '../assets/Orders.css'

const Order = () => {
  const [orders, setOrders] = useState([]);
  const userId = sessionStorage.getItem("userId"); // Getting userId from session storage

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:7000/orders/${userId}`)
        .then((response) => {
          console.log("Fetched orders:", response.data);
          setOrders(response.data); // Directly setting the fetched orders array
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
        });
    }
  }, [userId]);


  return (
    <div className="order-container">
      <h2 className="order-heading">My Orders</h2>
      {orders.length === 0 ? (
        <p className="order-message">No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
           {/* Looping through productIds and displaying product details */}
            {order.productIds?.map((product) => (
              <div key={product._id} className="order-product-info">
                <img
                  src={`http://localhost:7000/uploads/${product.productimages[0]}`}
                  alt={product.productname}
                  className="order-product-image"
                />
                <div className="order-details">
                  <p><strong>Product Name:</strong> {product.productname}</p>
                  <p className="order-amount"><strong>Amount Paid:</strong> ₹{order.amount}</p>
                  <p className="order-amount"><strong>Total Quantity:</strong> {order.quantity}</p>
                  <p className="order-status"><strong>Payment Status:</strong> {order.status}</p>
                  <p className="order-Deleverystatus"><div className="dstatus-color"></div><strong>Delevery Status:</strong> {order.deliveryStatus}</p>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default Order;
