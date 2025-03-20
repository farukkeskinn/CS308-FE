import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [products, setProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/products")
      .then((response) => {
        console.log("API Response:", response.data);
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, []);

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar onSearch={handleSearch} />

      {/* Hero Section */}
      <main className="flex-grow-1 container text-center py-5">
        <h1 className="fw-bold text-custom">Welcome to Neptune</h1>
        <p className="fs-5 text-muted">
          Discover the latest and greatest in technology. Explore our range of high-quality products.
        </p>

        {/* Product List */}
        <div className="container mt-4">
          <div className="row g-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div className="col-md-4" key={product.productId}>
                  <Link to={`/product/${product.productId}`} className="text-decoration-none text-dark">
                    <div className="card shadow p-3 text-center">
                      {}
                      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px", overflow: "hidden" }}>
                        <img 
                          src={product.image_url} 
                          className="img-fluid" 
                          alt={product.name} 
                          style={{ objectFit: "contain", maxHeight: "100%", width: "100%" }} 
                        />
                      </div>
                      <div className="card-body">
                        <div 
                          className="p-2 rounded text-white mb-2" 
                          style={{ backgroundColor: "#1f1c66", display: "inline-block", minWidth: "100%" }}
                        >
                          <h6 className="fw-bold mb-0">{product.name}</h6>
                        </div>
                        <p 
                          className="text-muted" 
                          style={{ fontSize: "15px", lineHeight: "1.5", minHeight: "60px", marginTop: "10px" }}
                        >
                          {product.description.length > 80 ? product.description.substring(0, 80) + "..." : product.description}
                        </p>

                        <p className="fw-bold text-primary fs-5">${product.price}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center mt-5">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/1178/1178479.png" 
                  alt="Not Found" 
                  style={{ width: "150px", opacity: "0.7", marginBottom: "10px" }} 
                />
                <h4 className="fw-bold text-danger">Oops! No products found</h4>
              </div>
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
