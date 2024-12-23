import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import BestofMobiles from './components/BestofMobiles';
import BestofAppliances from './components/BestofAppliance';
import CategoriesList from './components/CategoriesList';
import Slidebars from './components/Slidebars';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyProfile from './pages/MyProfile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Products from './pages/Products';  // Products page
import ProductDetailed from './pages/ProductDetailed';  
import Checkout from './pages/Checkout';
import CartCheckout from './pages/CartCheckout';
import Topstories from './components/Topstories'

const AppLayout = () => {
  const location = useLocation();

  // Define the routes that should hide Navbar, CategoriesList, and Slidebars
  const noLayoutRoutes = ['/login', '/signup', '/myprofile', '/orders', '/wishlist', '/cart'];

  // Check if the current pathname matches any of the routes in noLayoutRoutes
  const shouldHideLayout = noLayoutRoutes.includes(location.pathname) || location.pathname.startsWith('/checkout/') ||
  location.pathname.startsWith('/products/');

  return (
    <>
      {/* Show Navbar, CategoriesList, and Slidebars only when layout is not hidden */}
      {!shouldHideLayout && (
        <>
          <Header />
          <CategoriesList />
          <Slidebars />
          <BestofMobiles />
          <BestofAppliances />
          <Topstories />
        </>
      )}

      {/* Show Header only for routes where layout is hidden (e.g., Checkout, Login) */}
      {shouldHideLayout && (
         <>
        <Header />
        <Navbar />
        </>
        
      )}

      {/* Routes definition */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout/:productId" element={<Checkout />} />
        <Route path="/checkout/cart/:userId" element={<CartCheckout />} />
        <Route path="/products/:categoryId/:subcategoryId" element={<Products />} />
        <Route path="/products/:subcategoryName/:productId/:productName" element={<ProductDetailed />} />
        {/* Add other routes as needed */}
      </Routes>

      {/* Always show Footer */}
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
