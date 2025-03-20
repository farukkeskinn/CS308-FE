import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSignInAlt, FaShoppingCart, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [categories, setCategories] = useState([]); 
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [token, setToken] = useState(localStorage.getItem("jwtToken"));
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [logoClicked, setLogoClicked] = useState(false); // ✅ Logo animasyonu için state

  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });

    if (token) {
      fetch("http://localhost:8080/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.customer) {
            setCustomerName(data.customer.name || "");
          }
        })
        .catch(() => {
          setCustomerName("");
        });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken"); 
    setToken(null); 
    setProfileMenuOpen(false);
    setCustomerName("");
  };

  const handleLogoClick = () => {
    setLogoClicked(true);
    setTimeout(() => {
      window.location.reload(); // ✅ Sayfa yenileme
    }, 500); // ✅ 500ms sonra sayfa yenile (animasyon bitince)
  };

  return (
    <>
      {/* Üst Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom px-4">
        <div className="container d-flex justify-content-between align-items-center">
          {/* ✅ NEPTUNE Logosu - Animasyon ve Yenileme */}
          <span
            className={`navbar-brand fw-bold fs-3 text-white transition-transform ${logoClicked ? "animate-logo" : ""}`}
            onClick={handleLogoClick}
            style={{ cursor: "pointer", transition: "transform 0.3s ease-in-out" }}
          >
            NEPTUNE
          </span>

          <div className="d-flex gap-3 align-items-center">
            {token ? (
              <div className="position-relative">
                <button 
                  className="btn btn-outline-light d-flex align-items-center gap-2" 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  <FaUserCircle className="fs-5" />
                  {customerName || "Account"}
                </button>

                {profileMenuOpen && (
                  <div 
                    className="position-fixed top-0 end-0 mt-5 me-3 p-3 bg-white shadow-lg rounded"
                    style={{ zIndex: 1050, minWidth: "250px" }}
                  >
                    <p className="mb-2 fw-bold">{customerName}</p>
                    <hr />
                    <Link to="/profile" className="d-block text-decoration-none text-dark mb-2">View Profile</Link>
                    <button className="btn btn-danger w-100" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-white fs-5">
                <FaSignInAlt />
              </Link>
            )}

            {/* Sepet */}
            <Link to="/cart" className="text-white fs-5 position-relative">
              <FaShoppingCart />
              <span className="position-absolute top-0 start-100 translate-middle badge bg-danger p-1">
                0
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Alt Navbar (Kategori Menüsü) */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#1f1c66", marginTop: "3px" }}>
        <div className="container d-flex justify-content-center">
          <ul className="navbar-nav d-flex flex-row gap-4">
            {loading ? (
              <li className="nav-item">
                <span className="nav-link text-white">Loading...</span>
              </li>
            ) : categories.length > 0 ? (
              categories
                .filter((category) => category.parentCategory === null)
                .map((category, index) => (
                  <li 
                    key={index} 
                    className="nav-item dropdown position-relative"
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
                <span className="nav-link text-white">No Categories Found</span>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* CSS Animasyon */}
      <style>
        {`
          .animate-logo {
            transform: scale(1.2);
          }
        `}
      </style>
    </>
  );
};

export default Navbar;
