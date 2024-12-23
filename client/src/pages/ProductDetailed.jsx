import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaBolt, FaHeart } from 'react-icons/fa';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import '../assets/ProductDetailed.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'


const ProductDetailed = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ visible: false, type: 'success', message: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get('http://localhost:7000/products');
        const productData = response.data.data;
        const foundProduct = productData.find(item => item._id === productId);
        setProduct(foundProduct);
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    const userId = sessionStorage.getItem('userId');
    
    if (userId) {
      try {
        const response = await axios.post('http://localhost:7000/add-to-cart', {
          userId,
          productId,
        });
        
        // Show success alert
        setAlert({
          visible: true,
          type: 'success',
          message: response.data.message,
        });
        
        // Hide the alert after 2 seconds and then navigate to cart
        setTimeout(() => {
          setAlert({ visible: false, message: '' });
          navigate('/cart');
        }, 2000); // Delay navigation by 2 seconds
  
      } catch (error) {
        // Show error alert
        setAlert({
          visible: true,
          type: 'danger',
          message: 'Product already is in cart',
        });
  
        // Hide the alert after 2 seconds and then navigate to cart
        setTimeout(() => {
          setAlert({ visible: false, message: '' });
        }, 2000);
      }
    } else {
      navigate('/login', { state: { from: '/cart' } });
    }
  };
  

  const handleAddToWishlist = async () => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      try {
        const response = await axios.post('http://localhost:7000/wishlist/add-to-wishlist', {
          userId,
          productId,
        });
        setAlert({
          visible: true,
          type: 'success',
          message: response.data.message,
        });
        setTimeout(() => setAlert({ visible: false, message: '' }), 2000);
      } catch (error) {
        setAlert({
          visible: true,
          type: 'danger',
          message: 'Product is already in wishlist.',
        });
        setTimeout(() => setAlert({ visible: false, message: '' }), 2000);
      }
    } else {
      navigate('/login', { state: { from: '/wishlist' } });
    }
  };


  const handleBuynow = async () => {
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
      // Fetch user data from the server
      const { data } = await axios.get(`http://localhost:7000/users/${userId}`);
  
      // Check if user data is available
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
  
      // Check for address and mobile details
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
  
      // All checks passed
      setAlert({
        visible: true,
        type: 'success',
        message: 'Please hold on for a moment, we will be with you shortly.',
      });
      setTimeout(() => {
        setAlert({ visible: false, message: '' });
        navigate(`/checkout/${productId}`);
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
  


  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center">Product not found.</div>;
  }

  return (
    <div className="product-details container-fluid">
       {/* Bootstrap Alert with animations */}
       {alert.visible && (
        <div className={`alert alert-${alert.type} alert-dismissible`} role="alert" style={{
          width: '40%',
          height: '50px',
          textAlign: 'center',
          position: 'fixed', // Ensures the alert is not fixed in place but still visible
          top: '12%', // Shows the alert 10% from the top of the screen
          left: '50%',
          transform: 'translateX(-50%)', // Centers the alert horizontally
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Adds a soft shadow to the alert
          zIndex: 9999, // Ensures it's on top of other elements
          opacity: alert.visible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out', // Smooth transition for alert visibility
        }} aria-live="polite">
           <i className={`bi ${ alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'  } me-2`}></i>                        
          {alert.message}
        </div>
      )}

      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>{product.subcategory.name}</Breadcrumb.Item>
        <Breadcrumb.Item active>{product.productname}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="row">
        <div className="col-sm-12 col-md-6 product-images">
        <Zoom >
          <div className="main-image">
            {product.productimages && product.productimages.length > 0 ? (
              <>
              
                <img src={`http://localhost:7000/uploads/${product.productimages[0]}`} alt={product.productname} className="img-fluid" />
              </>
            ) : (
              <p>No images available.</p>
            )}
          </div>
           </Zoom>
          <FaHeart className="wishlist-icons" onClick={handleAddToWishlist} />
         
          <div className="thumbnails">
            {product.productimages.map((image, index) => (
              <img
                key={index}
                src={`http://localhost:7000/uploads/${image}`}
                alt={product.productname}
                className="img-thumbnail"
                onClick={() => {
                  document.querySelector('.main-image img').src = `http://localhost:7000/uploads/${image}`;
                }}
              />
            ))}
          </div>

          <div className="product-actions mt-3">
            <button className="btn btn-warning me-2" onClick={handleAddToCart}>
              <FaShoppingCart className="me-2" /> Add to Cart
            </button>
            <button className="btn btn-danger" onClick={handleBuynow}>
              <FaBolt className="me-2" /> Buy Now
            </button>
          </div>
        </div>

        <div className="col-sm-12 col-md-6 product-info">
          <h2 className='prodname'>{product.productname}</h2>
          <span className="discount-price"> ₹{product.productafterdiscount}</span>
          <span className="text-muted original-price"> ₹{product.productbeforediscount}</span>

          {product.productHighlight && (
            <div className="product-highlights">
              <h4>Highlights</h4>
              <ul>
                {typeof product.productHighlight === 'string'
                  ? product.productHighlight
                      .split('\r\n')
                      .filter(highlight => highlight.trim() !== '')
                      .map((highlight, index) => (
                        <li key={index}>{highlight.trim()}</li>
                      ))
                  : product.productHighlight.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
              </ul>
            </div>
          )}

          <p><strong>Description:</strong> {product.productDiscription}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailed;
