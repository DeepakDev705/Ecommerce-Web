import React from 'react';
import { Link } from 'react-router-dom';
import cardImage from '../Images/c1.svg';
import '../assets/Footer.css'; // Assuming you create a separate CSS file

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="container">
        <div className="row">
          {/* About Us Section */}
          <div className="col-md-3 footer-section">
            <h5 className="footer-heading">About Us</h5>
            <span>
              We are your one-stop destination for all things fashion, electronics, and more! Shop with us and experience quality products at amazing prices.
            </span>
          </div>

          {/* Contact Us Section */}
          <div className="col-md-3 footer-section contact-info">
            <h5 className="footer-heading">Contact Us</h5>
            <span>
              Fashnear Technologies Private Limited 3rd Floor, Wing-E, Helios Business Bangalore South, Karnataka, India, 560103
            </span>
            <span>
              E-mail: <a href="mailto:query@Ecommerce.com">Ecommerce.com</a>
            </span>
            <span>&copy; 2023-2024 Ecommerce | Web.com</span>
          </div>

          {/* Quick Links Section */}
          <div className="col-md-3 footer-section">
            <h5 className="footer-heading">Quick Links</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/faqs">FAQs</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="col-md-3 footer-section">
            <h5 className="footer-heading">Follow Us</h5>
            <div className="social-icons">
              <button className="social-button" aria-label="Facebook" onClick={() => window.open('https://facebook.com', '_blank')}>
                <i className="fab fa-facebook-f"></i>
              </button>
              <button className="social-button" aria-label="Twitter" onClick={() => window.open('https://twitter.com', '_blank')}>
                <i className="fab fa-twitter"></i>
              </button>
              <button className="social-button" aria-label="Instagram" onClick={() => window.open('https://instagram.com', '_blank')}>
                <i className="fab fa-instagram"></i>
              </button>
              <button className="social-button" aria-label="LinkedIn" onClick={() => window.open('https://linkedin.com', '_blank')}>
                <i className="fab fa-linkedin"></i>
              </button>

              <div className="cardImage">
                <img 
                    src={cardImage} 
                    alt="Credit card"
                />
            </div>

            </div>
          </div>
        </div>
      </div>
      {/* Footer Bottom Section */}
      <div className="footer-bottom">
        <span>&copy; 2024 YourStore | All rights reserved To Ecommerce | Web</span>
      </div>
    </footer>
  );
};

export default Footer;
