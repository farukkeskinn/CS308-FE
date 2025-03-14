import { useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import { FaSignInAlt, FaShoppingCart } from "react-icons/fa";
import "../pages/Home.css"; // CSS dosyasını içe aktarıyoruz

const categories = [
  { name: "Laptops", subcategories: ["Gaming Laptops", "Ultrabooks", "Business Laptops"] },
  { name: "Smartphones", subcategories: ["Android", "iOS"] },
  { name: "Accessories", subcategories: ["Headphones", "Keyboards", "Mice"] },
  { name: "Gaming", subcategories: ["Consoles", "Gaming PCs", "VR Headsets"] }
];

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  let timeout;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom px-4">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo (Hover ile büyüyen) */}
        <Link
          className="navbar-brand fw-bold fs-3 text-white transition-transform"
          to="/"
          style={{ transition: "transform 0.3s ease-in-out" }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          NEPTUNE
        </Link>

        {/* Kategoriler Dropdown Menü */}
        <ul className="navbar-nav d-flex flex-row gap-4">
          {categories.map((category, index) => (
            <li 
              key={index} 
              className="nav-item dropdown position-relative"
              onMouseEnter={() => {
                clearTimeout(timeout); 
                setDropdownOpen(index);
              }}
              onMouseLeave={() => {
                timeout = setTimeout(() => setDropdownOpen(null), 500);
              }}
            >
              {/* Ana Kategori */}
              <Link
                className="nav-link text-white dropdown-toggle"
                to="#"
                style={{ fontSize: "14px" }}
              >
                {category.name}
              </Link>

              {/* Dropdown Menü (Alt Kategoriler) */}
              {dropdownOpen === index && (
                <ul
                  className="dropdown-menu show position-absolute mt-2"
                  onMouseEnter={() => {
                    clearTimeout(timeout);
                    setDropdownOpen(index);
                  }}
                  onMouseLeave={() => {
                    timeout = setTimeout(() => setDropdownOpen(null), 500);
                  }}
                >
                  {category.subcategories.map((sub, subIndex) => (
                    <li key={subIndex}>
                      <Link className="dropdown-item" to={`/category/${sub}`}>
                        {sub}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Login & Cart (İkonlar Küçültüldü) */}
        <div className="d-flex gap-3 align-items-center">
          <Link to="/login" className="text-white fs-5">
            <FaSignInAlt />
          </Link>
          <Link to="/cart" className="text-white fs-5 position-relative">
            <FaShoppingCart />
            {/* Küçültülmüş Sepet Sayısı */}
            <span className="position-absolute top-0 start-100 translate-middle badge bg-danger p-1" style={{ fontSize: "10px", minWidth: "15px" }}>
              0
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
