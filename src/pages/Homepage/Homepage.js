import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";

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
                <div className="col-md-4" key={product.productId}>
                  <Link to={`/product/${product.productId}`} className="text-decoration-none text-dark">
                    <div className="card shadow p-3 text-center">
                      {/* ✅ Resim Sabit Boyutta, Oranı Bozulmadan */}
                      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px", overflow: "hidden" }}>
                        <img 
                          src={product.image_url} 
                          className="img-fluid" 
                          alt={product.name} 
                          style={{ objectFit: "contain", maxHeight: "100%", width: "100%" }} 
                        />
                      </div>
                      <div className="card-body">
                        {/* ✅ Ürün adı lacivert kutunun içinde */}
                        <div 
                          className="p-2 rounded text-white mb-2" 
                          style={{ backgroundColor: "#1f1c66", display: "inline-block", minWidth: "100%" }}
                        >
                          <h6 className="fw-bold mb-0">{product.name}</h6>
                        </div>
                        
                        {/* ✅ Açıklama (Description) - Biraz daha büyük ve altta */}
                        <p 
                          className="text-muted" 
                          style={{ fontSize: "15px", lineHeight: "1.5", minHeight: "60px", marginTop: "10px" }}
                        >
                          {product.description.length > 80 ? product.description.substring(0, 80) + "..." : product.description}
                        </p>

                        {/* ✅ Fiyat bilgisi */}
                        <p className="fw-bold text-primary fs-5">${product.price}</p>
                      </div>
                    </div>
                  </Link>
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
