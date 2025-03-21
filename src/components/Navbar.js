import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignInAlt, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import SearchBar from "./ui/SearchBar"; 

const Navbar = () => {  
  const [categories, setCategories] = useState([]); 
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("jwtToken"));
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const navigate = useNavigate();

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

  const handleSearch = (query) => {
    if (query.trim() !== "") {
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken"); 
    setToken(null); 
    setProfileMenuOpen(false);
    setCustomerName("");
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom px-4">
        <div className="container d-flex justify-content-between align-items-center">
          <Link
            className="navbar-brand fw-bold fs-3 text-white transition-transform"
            to="/"
            style={{ transition: "transform 0.3s ease-in-out" }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            NEPTUNE
          </Link>
          <div className="flex-grow-1 mx-3 d-flex justify-content-center">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="d-flex align-items-center gap-2">
            {token ? (
              <div 
                className="position-relative d-flex justify-content-center align-items-center"
                onMouseEnter={() => setProfileMenuOpen(true)}
                onMouseLeave={() => setProfileMenuOpen(false)}
                style={{ width: "180px" }}
              >
                <button 
                  className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2 w-100 text-center"
                  style={{ height: "40px" }}
                >
                  <FaUserCircle className="fs-5" />
                  <span>{customerName || "Account"}</span>
                </button>
                {profileMenuOpen && (
                  <div 
                    className="position-absolute w-100 bg-white shadow-lg rounded border text-center"
                    style={{ minWidth: "180px", top: "100%", left: 0, zIndex: 1050 }}
                  >
                    <Link to="/profile" className="d-block py-2 text-decoration-none text-dark fw-bold">
                      View Profile
                    </Link>
                    <button className="btn btn-danger w-100 py-2" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="d-flex justify-content-center align-items-center"
                style={{ width: "180px", textAlign: "center" }}
              >
                <Link 
                  to="/login" 
                  className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2 w-100 text-center"
                  style={{ height: "40px" }}
                >
                  <FaSignInAlt />
                  <span>Login / Register</span>
                </Link>
              </div>
            )}
            <Link to="/cart" className="text-white fs-5 position-relative">
              <FaShoppingCart />
              <span className="position-absolute top-0 start-100 translate-middle badge bg-danger p-1">
                0
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom Navbar for Categories */}
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
                <span className="nav-link text-dark">No Categories Found!</span>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
