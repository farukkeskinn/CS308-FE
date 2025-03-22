import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import SortIcon from "@mui/icons-material/Sort"; // ✅ MUI Sort Icon
import { Menu, MenuItem, Button } from "@mui/material"; // ✅ MUI Dropdown Menu
import "../CategoryPage/CategoryPage.css";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("Ürünler");
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setSortOption(""); 
  }, [categoryId]);
  
  useEffect(() => {
    if (!categoryId) return;


    axios
      .get(`http://localhost:8080/api/products/by-category/${categoryId}`)
      .then((response) => {
        setProducts(response.data.content || []);

        if (response.data.content && response.data.content.length > 0) {
          const firstProductCategory = response.data.content[0].category;

          if (
            firstProductCategory.parentCategory &&
            firstProductCategory.parentCategory.categoryId == categoryId
          ) {
            setCategoryName(firstProductCategory.parentCategory.categoryName);
          } else {
            setCategoryName(firstProductCategory.categoryName);
          }
        } else {
          setCategoryName("Bilinmeyen Kategori");
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Ürünleri yüklerken hata oluştu:", error);
        setLoading(false);
      });
  }, [categoryId]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "priceLow") return a.price - b.price;
    if (sortOption === "priceHigh") return b.price - a.price;
    if (sortOption === "ratingLow") return a.rating - b.rating;
    if (sortOption === "ratingHigh") return b.rating - a.rating;
    return 0;
  });

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = (option) => {
    if (option) setSortOption(option);
    setAnchorEl(null);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1 container text-left py-5">
        <div className="container d-flex justify-content-between align-items-center">
          <h2 className="category-title">{categoryName}</h2>

          {/* ✅ Modern Sort Dropdown */}
          <div className="sort-bar">
            <Button
              onClick={handleClick}
              startIcon={<SortIcon />}
              variant="contained"
              className="sort-button"
              style={{ backgroundColor: "#1f1c66", color: "white" }}
            >
              {sortOption ? ` ${sortOption}` : "Sort"}
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose(null)}>
              <MenuItem onClick={() => handleClose("Low to High Price")}>Low to High Price</MenuItem>
              <MenuItem onClick={() => handleClose("High to Low Price")}>High to Low Price</MenuItem>
              <MenuItem onClick={() => handleClose("Low to High Rating")}>Low to High Rating</MenuItem>
              <MenuItem onClick={() => handleClose("High to Low Rating")}>High to Low Rating</MenuItem>
            </Menu>
          </div>
        </div>

        
        <div className="container mt-4">
          <div className="row g-4">
            {loading ? (
              <p>Loading products...</p>
            ) : sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <div className="col-md-4" key={product.productId}>
                  <Link
                    to={`/product/${product.productId}`}
                    className="text-decoration-none text-dark"
                  >
                    <div className="card shadow p-3 text-center">
                      <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ height: "200px", overflow: "hidden" }}
                      >
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
                          style={{
                            backgroundColor: "#1f1c66",
                            display: "inline-block",
                            minWidth: "100%",
                          }}
                        >
                          <h6 className="fw-bold mb-0">{product.name}</h6>
                        </div>

                        <p
                          className="text-muted"
                          style={{
                            fontSize: "15px",
                            lineHeight: "1.5",
                            minHeight: "60px",
                            marginTop: "10px",
                          }}
                        >
                          {product.description.length > 80
                            ? product.description.substring(0, 80) + "..."
                            : product.description}
                        </p>

                        <p className="fw-bold text-primary fs-5">${product.price}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p>Bu kategoride ürün bulunamadı.</p>
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
