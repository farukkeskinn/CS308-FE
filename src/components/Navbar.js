import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSignInAlt, FaShoppingCart } from "react-icons/fa";
import SearchBar from "./ui/SearchBar";

const Navbar = ({ onSearch }) => {  
  const [categories, setCategories] = useState([]); 
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data);
        setCategories(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom px-4">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          {/* ✅ Logo */}
          <Link className="navbar-brand fw-bold fs-3 text-white" to="/">
            NEPTUNE
          </Link>
          <div className="flex-grow-1 mx-3 d-flex justify-content-center">
            <SearchBar onSearch={onSearch} />
          </div>

          <div className="d-flex gap-3 align-items-center">
            <Link to="/login" className="text-white fs-5">
              <FaSignInAlt />
            </Link>
            <Link to="/cart" className="text-white fs-5 position-relative">
              <FaShoppingCart />
              <span className="position-absolute top-0 start-100 translate-middle badge bg-danger p-1">
                0
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#1f1c66", marginTop: "3px" }}>
        <div className="container d-flex flex-wrap justify-content-center">
          <ul className="navbar-nav d-flex flex-row flex-wrap gap-2">
            {loading ? (
              <li className="nav-item">
                <span className="nav-link text-dark">Loading...</span>
              </li>
            ) : categories.length > 0 ? (
              categories
                .filter((category) => category.parentCategory === null)
                .map((category, index) => (
                  <li 
                    key={index} 
                    className="nav-item dropdown"
                    onMouseEnter={() => setActiveDropdown(index)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link className="nav-link text-white dropdown-toggle" to="#">
                      {category.categoryName}
                    </Link>
                    {activeDropdown === index && (
                      <ul className="dropdown-menu show position-absolute mt-2">
                        {categories
                          .filter((sub) => sub.parentCategory?.categoryId === category.categoryId)
                          .map((sub, subIndex) => (
                            <li key={subIndex}>
                              <Link className="dropdown-item" to={`/category/${sub.categoryName}`}>
                                {sub.categoryName}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))
            ) : (
              <li className="nav-item">
                <span className="nav-link text-dark">No Categories Found</span>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
