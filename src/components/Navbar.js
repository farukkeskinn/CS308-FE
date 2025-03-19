import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSignInAlt, FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
  const [categories, setCategories] = useState([]); 
  const [activeDropdown, setActiveDropdown] = useState(null); // ✅ Açık olan dropdown state
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
      {/* Eski Navbar (Değişmedi) */}
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom px-4">
        <div className="container d-flex justify-content-between align-items-center">
          <Link className="navbar-brand fw-bold fs-3 text-white transition-transform" to="/">
            NEPTUNE
          </Link>

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

      {/* Yeni Alt Navbar (Renk: #ebe715) */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#1f1c66", marginTop: "3px" }}>
        <div className="container d-flex justify-content-center">
          <ul className="navbar-nav d-flex flex-row gap-4">
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
                    className="nav-item dropdown position-relative"
                    onMouseEnter={() => setActiveDropdown(index)} // ✅ Mouse girince aç
                    onMouseLeave={() => setActiveDropdown(null)} // ❌ Mouse çıkınca kapat
                  >
                    <Link className="nav-link text-white dropdown-toggle" to="#">
                      {category.categoryName}
                    </Link>

                    {/* Subcategory Açılır Menü */}
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

