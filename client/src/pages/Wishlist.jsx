import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Wishlist.css'; // Ensure this points to your CSS file
import { FaTrash } from 'react-icons/fa'; // Import the trash icon from react-icons
import axios from 'axios'; // Import axios for making API requests
import 'bootstrap-icons/font/bootstrap-icons.css';

const Wishlist = () => {
  const navigate = useNavigate(); // Hook to navigate
  const [wishlist, setWishlist] = useState([]);
  const [alert, setAlert] = useState({
    type: '', // 'success' or 'danger'
    message: '',
    visible: false,
  });

  useEffect(() => {
    const userId = sessionStorage.getItem('userId'); // Check for user ID

    if (!userId) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/wishlist' } });
      return; // Exit useEffect
    }

    // Fetch wishlist items for the user
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/wishlist/${userId}`);
        const wishlistItems = response.data.products; // Assuming 'products' is the array of wishlist items
        setWishlist(wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, [navigate]);

  // Function to remove an item from the wishlist
  const handleRemoveFromWishlist = async (productId) => {
    const userId = sessionStorage.getItem('userId'); // Adjust based on your auth system
    try {
      await axios.delete(`http://localhost:7000/wishlist/${userId}/${productId}`);
      const updatedWishlist = wishlist.filter(item => item._id !== productId);
      setWishlist(updatedWishlist);

      // Show success alert
      setAlert({
        type: 'success',
        message: 'Product removed from wishlist.',
        visible: true,
      });

      // Hide alert after 3 seconds
      setTimeout(() => {
        setAlert({ ...alert, visible: false });
      }, 3000);
    } catch (error) {
      console.error('Error removing item from wishlist:', error);

      // Show error alert
      setAlert({
        type: 'danger',
        message: 'Failed to remove item from wishlist. Please try again.',
        visible: true,
      });

      // Hide alert after 3 seconds
      setTimeout(() => {
        setAlert({ ...alert, visible: false });
      }, 3000);
    }
  };

  return (
    <div className="custom-wishlist-pages container">
      <h2 className="custom-wishlist-title">Your Wishlist</h2>

      {/* Success/Error alert */}
      {alert.visible && (
        <div className={`alert alert-${alert.type} alert-dismissible`} role="alert" style={{
          width: '30%',
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
        }} aria-live="polite">
           <i className={`bi ${ alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'  } me-2`}></i>
          {alert.message}
        </div>
      )}

      {wishlist.length === 0 ? (
        <p>No products in your wishlist.</p>
      ) : (
        <ul className="custom-wishlist-list list-group">
          {wishlist.map(item => (
            <li key={item._id} className="custom-wishlist-item list-group-item"> {/* Use _id for unique key */}
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <img
                    src={`http://localhost:7000/uploads/${item.productimages[0]}`} // Use the first image
                    alt={item.productname}
                    className="img-fluid custom-wishlist-image me-3"
                  />
                  <div>
                    <h5 className="custom-wishlist-product-name">{item.productname}</h5>
                    <p className="card-text text-muted">
                      <span className="discounted-price">₹{item.productafterdiscount}</span>
                      <span className="original-price text-decoration-line-through">₹{item.productbeforediscount}</span>
                    </p>
                  </div>
                </div>
                
                <button 
                  className="custom-remove-wishlist-btn" // Unique class name for the trash icon button
                  onClick={() => handleRemoveFromWishlist(item._id)} // Use _id for deletion
                >
                  <FaTrash className="custom-trash-icon" /> {/* Custom class for the icon */}
                </button>
               
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Wishlist;
