import React from "react";
import { Link } from "react-router-dom";
import "../pages/Homepage/Home.css";

const Navbar = () => {
  return (
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
      </div>
    </nav>
  );
};

export default Navbar;