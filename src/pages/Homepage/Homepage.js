import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

export default function HomePage() {
  const [products, setProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchParams] = useSearchParams(); 
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    axios.get("http://localhost:8080/api/products")
      .then((response) => {
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, []);

  useEffect(() => {
    const query = searchParams.get("search"); 
    if (query) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchParams, products]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1 container text-center py-5">
        <h1 className="fw-bold text-custom">Welcome to NEPTUNE</h1>
        <p className="fs-5 text-muted"
          style={{ marginBottom: "30px" }} 
        >
          Discover the latest and greatest in technology. Explore our range of high-quality products.
        </p>

        {/* Product List */}
        <div className="container mt-4">
          <div className="row g-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div className="col-md-4" key={product.productId}>
                  <div className="card shadow p-3 text-center">
                    <div className="card-body">
                      <Link to={`/product/${product.productId}`} className="text-decoration-none text-dark d-block">
                        <div 
                          className="d-flex justify-content-center align-items-center" 
                          style={{ height: "220px", overflow: "hidden", marginBottom: "15px" }} 
                        >
                          <img 
                            src={product.image_url} 
                            className="img-fluid" 
                            alt={product.name} 
                            style={{ objectFit: "contain", maxHeight: "100%", width: "100%" }} 
                          />
                        </div>
                        <div 
                          className="p-2 rounded text-white" 
                          style={{ backgroundColor: "#1f1c66", display: "inline-block", minWidth: "100%", marginBottom: "20px" }}
                        >
                          <h6 className="fw-bold mb-0">{product.name}</h6>
                        </div>
                        <p 
                          className="text-muted text-center" 
                          style={{ fontSize: "15px", lineHeight: "1.5", minHeight: "50px", marginBottom: "5px" }}
                        >
                          {product.description.length > 80 ? product.description.substring(0, 80) + "..." : product.description}
                        </p>
                        <p style={{ color: "#1f1c66", fontWeight: "bold" }}>
                          {(() => {
                            const priceParts = product.price.toFixed(2).split(".");
                            return (
                              <>
                                <span style={{ fontSize: "33px", fontWeight: "bold" }}>${priceParts[0]}</span>
                                <sup style={{ fontSize: "20px", fontWeight: "normal" }}>.{priceParts[1]}</sup>
                              </>
                            );
                          })()}
                        </p>
                      </Link>
                      <div className="d-flex justify-content-center gap-3 mt-3">
                        <button 
                          className="btn btn-primary shadow-lg border-0 w-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Added ${product.name} to cart`);
                          }}
                          style={{ 
                            backgroundColor: "#1f1c66", 
                            height: "45px", 
                            borderRadius: "20px", 
                            fontWeight: "bold",
                            fontSize: "12px"
                          }}
                        >
                          🛒 Add to Cart
                        </button>
                        
                        <button 
                          className={`btn ${favorites[product.productId] ? "btn-success" : "btn-outline-danger"} shadow-lg w-50`} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setFavorites((prev) => ({
                              ...prev,
                              [product.productId]: !prev[product.productId],
                            }));
                          }}
                          style={{ 
                            height: "45px", 
                            borderRadius: "20px", 
                            borderWidth: "2px", 
                            fontWeight: "bold",
                            fontSize: "12px"
                          }}
                        >
                          {favorites[product.productId] ? "✅ Added to Favorites" : "❤️ Add to Favorites"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center mt-5">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/1178/1178479.png" 
                  alt="Not Found" 
                  style={{ width: "150px", opacity: "0.7", marginBottom: "40px" }} 
                />
                <h4 className="fw-bold text-danger">Oops! No products found.</h4>
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