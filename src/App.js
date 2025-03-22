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

function App() {
  return (
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
                <Route path="/category/:categoryId" element={<CategoryPage />} /> {/* ✅ Yeni Route eklendi */}

              </Routes>
            </>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;