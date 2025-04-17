import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from "react";

import Homepage from "./pages/Homepage/Homepage";
import LoginPage from "./pages/Login/LoginPage";
import Register from "./pages/Register/Register";
import Productpage from "./pages/Productpage/Productpage";
import Navbar from "./components/Navbar";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import SearchPage from "./pages/SearchPage/SearchPage";
import ShoppingCart from "./pages/ShoppingCart/ShoppingCart";
import { CartProvider } from "./context/CartContext"; // ← Burayı ekle
import OrderHistory from "./pages/Orderpage/OrderPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage"; // Doğru
import ThankYouPage from "./pages/ThankYouPage/ThankYouPage"; // Doğru

function App() {
  useEffect(() => {
    const fetchCustomerId = async () => {
      const existingId = localStorage.getItem("customerId");
      if (!existingId) {
        try {
          const response = await axios.get("http://localhost:8080/api/customers/me", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          });
          console.log("Customer:", response.data); // Confirm the shape
          localStorage.setItem("customerId", response.data.id);
        } catch (err) {
          console.error("Error fetching customer ID:", err);
        }
      }
    };
  
    fetchCustomerId();
  }, []);
  

  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/product/:productId" element={<Productpage />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/cart" element={<ShoppingCart />} />
                  <Route path="/orderpage" element={<OrderHistory />} />
                  <Route path="/orderpage/:orderId" element={<OrderHistory />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/thank-you" element={<ThankYouPage />} />
                </Routes>
              </>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
