import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/products")
      .then((response) => {
        console.log("API Response:", response.data);
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-grow-1 container text-center py-5">
        <h1 className="fw-bold text-custom">Welcome to Neptune</h1>
        <p className="fs-5 text-muted">
          Discover the latest and greatest in technology. Explore our range of high-quality products.
        </p>

        {/* MySQL'den Gelen Ürünler */}
        <div className="container mt-4">
          <h2 className="text-center text-custom fw-semibold mb-4">Our Products</h2>
          <div className="row g-4">
            {products.length > 0 ? (
              products.map((product) => (
                <div className="col-md-4" key={product.id}>
                  <div className="card shadow">
                    <img src={product.image} className="card-img-top" alt={product.name} />
                    <div className="card-body text-center">
                      <h5 className="card-title">{product.name}</h5>
                      <p className="card-text">{product.price} TL</p>
                      <button className="btn btn-primary w-100">Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Loading products...</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer bg-dark text-white text-center py-3 mt-auto">
        &copy; 2025 Neptune. All rights reserved.
      </footer>
    </div>
  );
}
