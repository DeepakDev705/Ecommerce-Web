import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTrash } from 'react-icons/fa';
import '../assets/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState([]);
  const [alert, setAlert] = useState({ visible: false, type: 'success', message: '' });

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');

    if (!userId) {
      navigate('/login', { state: { from: '/cart' } });
    } else {
      const fetchCartProducts = async () => {
        try {
          const response = await axios.get(`http://localhost:7000/cart/${userId}`);
          const cart = response.data;

          const selectedProducts = cart.products.map(product => ({
            ...product,
            quantity: 1,
          }));

          setCartProducts(selectedProducts);
        } catch (error) {
          console.error('Error fetching cart products:', error);
        }
      };

      fetchCartProducts();
    }
  }, [navigate]);

  const handleProductClick = (product) => {
    navigate(`/products/${product.subcategory.name}/${product._id}/${product.productname}`);
  };

  const handleQuantityChange = (productId, delta) => {
    const updatedCartProducts = cartProducts.map(product => {
      if (product._id === productId) {
        const newQuantity = Math.max(1, product.quantity + delta);
        return { ...product, quantity: newQuantity };
      }
      return product;
    });

    setCartProducts(updatedCartProducts);
  };

  const handleRemove = async (productId) => {
    const userId = sessionStorage.getItem('userId');
    try {
      await axios.delete(`http://localhost:7000/cart/${userId}/${productId}`);
      const updatedCartProducts = cartProducts.filter(product => product._id !== productId);
      setCartProducts(updatedCartProducts);
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  const handleproceedtocheckout = async () => {
    const userId = sessionStorage.getItem('userId');

    if (!userId) {
      setAlert({
        visible: true,
        type: 'danger',
        message: 'Please log in to your account to access all features.',
      });
      setTimeout(() => {
        setAlert({ visible: false, message: '' });
        navigate('/login');
      }, 2000);
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:7000/users/${userId}`);

      if (!data) {
        setAlert({
          visible: true,
          type: 'danger',
          message: 'User not found. Please log in again.',
        });
        setTimeout(() => {
          setAlert({ visible: false, message: '' });
          navigate('/login');
        }, 2000);
        return;
      }

      if (!data.address || !data.mobile) {
        setAlert({
          visible: true,
          type: 'danger',
          message: 'Complete your address and mobile to proceed.',
        });
        setTimeout(() => {
          setAlert({ visible: false, message: '' });
          navigate('/myprofile');
        }, 2000);
        return;
      }

      setAlert({
        visible: true,
        type: 'success',
        message: 'Please hold on for a moment, we will be with you shortly.',
      });
      setTimeout(() => {
        setAlert({ visible: false, message: '' });
        navigate(`/checkout/cart/${userId}`);
      }, 4000);
    } catch (error) {
      console.error('Error during user validation:', error);
      setAlert({
        visible: true,
        type: 'danger',
        message: 'Something went wrong. Please try again.',
      });
      setTimeout(() => setAlert({ visible: false, message: '' }), 2000);
    }
  };

  const priceDetails = cartProducts.reduce(
    (acc, product) => {
      const itemTotal = product.productafterdiscount * product.quantity;
      const discount = (product.productbeforediscount - product.productafterdiscount) * product.quantity;
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
    return <p className="text-center cart-empty">Your cart is empty. <a href="/">Start shopping now!</a></p>;
  }

  return (
    <div className="container cart-page">
      <h2 className="text-center mb-4">My Cart</h2>

      {alert.visible && (
        <div className={`alert alert-${alert.type}`} role="alert"
        style={{
          width: '40%',
          height: '50px',
          textAlign: 'center',
          position: 'fixed',
          top: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          opacity: alert.visible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
        aria-live="polite"
        >
           <i className={`bi ${ alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'  } me-2`}
            ></i>
          {alert.message}
        </div>
      )}

      <div className="row">
        {cartProducts.map((product) => (
          <div key={product._id} className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="row g-0">
                <div className="col-md-4 text-center">
                  <div className="img-wrapper" onClick={() => handleProductClick(product)}>
                    <img
                      src={`http://localhost:7000/uploads/${product.productimages[0]}`}
                      className="img-fluid rounded"
                      alt={product.productname}
                    />
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h5 className="card-title">{product.productname}</h5>
                    <p className="card-text text-muted">
                      <span className="discounted-price">₹{product.productafterdiscount}</span>
                      <span className="original-price text-decoration-line-through">₹{product.productbeforediscount}</span>
                    </p>
                    <div className="quantity-control">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleQuantityChange(product._id, -1)}
                      >
                        -
                      </button>
                      <span className="mx-2">{product.quantity}</span>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleQuantityChange(product._id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn btn-danger mt-3"
                      onClick={() => handleRemove(product._id)}
                    >
                      <FaTrash className="trash-icon" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary mt-4 p-4 border rounded">
        <h4 className="text-center mb-4">Price Details</h4>
        <ul className="list-unstyled">
          <li className="d-flex justify-content-between">
            <span>Price ({cartProducts.length} items)</span>
            <span>₹{priceDetails.price}</span>
          </li>
          <li className="d-flex justify-content-between">
            <span>Discount</span>
            <span className="text-success">-₹{priceDetails.discount}</span>
          </li>
          <li className="d-flex justify-content-between">
            <span>Shipping Charges</span>
            <span>₹{priceDetails.shipping}</span>
          </li>
          <li className="d-flex justify-content-between">
            <span>Secured Packaging Fee</span>
            <span>₹{packagingFee}</span>
          </li>
          <li className="d-flex justify-content-between font-weight-bold">
            <span>Total Amount</span>
            <span>₹{grandTotal}</span>
          </li>
          <li className="text-success text-center mt-2">
            You will save ₹{priceDetails.discount} on this order
          </li>
        </ul>
        <button className="btn btn-success btn-lg w-100 mt-4" onClick={handleproceedtocheckout}>Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default Cart;
