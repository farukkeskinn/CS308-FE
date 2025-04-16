import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { CartProvider } from "./context/CartContext";
import SalesDashboard from "./pages/SalesDashboard/SalesDashboard";
import ProductDashboard from './pages/ProductDashboard/ProductDashboard';
import NewProductForm from "./pages/ProductDashboard/NewProductForm";
import NewCategoryForm from "./pages/ProductDashboard/NewCategoryForm";
import CategoryDashboard from "./pages/ProductDashboard/CategoryDashboard";

function App() {
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
                  <Route path="/salesdashboard" element={<SalesDashboard />} />
                  <Route path="/productdashboard" element={<ProductDashboard />} />
                  <Route path="/productdashboard/new-product" element={<NewProductForm />} />
                  <Route path="/productdashboard/new-category" element={<NewCategoryForm />} />
                  <Route path="/productdashboard/categories" element={<CategoryDashboard />} />
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