import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Fetch cart items from local storage or API
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedCartItems);
  }, []);

  const handleRemoveItem = (productId) => {
    const updatedCartItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCartItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar />

      {/* Shopping Cart Section */}
      <main className="flex-grow-1 container py-5">
        <h1 className="fw-bold text-custom text-center">Shopping Cart</h1>
        <div className="container mt-4">
          {cartItems.length > 0 ? (
            <div className="row g-4">
              {cartItems.map((item) => (
                <div className="col-md-4" key={item.id}>
                  <div className="card shadow">
                    <img src={item.image} className="card-img-top" alt={item.name} />
                    <div className="card-body text-center">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text">{item.price} TL</p>
                      <button
                        className="btn btn-danger w-100"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove from Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">Your cart is empty.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer bg-dark text-white text-center py-3 mt-auto">
        &copy; 2025 Neptune. All rights reserved.
      </footer>
    </div>
  );
}