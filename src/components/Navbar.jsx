import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchBar from "./SearchBar";
import { IconButton, Snackbar, Box } from "@mui/material";
import Badge from "@mui/material/Badge";
import { useCartContext } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";


const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("jwtToken"));
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
  const { cartItems, setCartItems } = useCartContext();
  // ➤ useWishlist içinden sayacı alalım
  const { items: favItems, loading: favLoading } = useWishlist();
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const favCount = favLoading ? 0 : favItems.length;

  const { items } = useWishlist();

  const location = useLocation();

  const totalQty = Array.isArray(cartItems) ? cartItems.reduce((t, itm) => t + (itm?.quantity || 0), 0) : 0;

  const isCustomer = token && userRole !== "SALES_MANAGER" && userRole !== "PRODUCT_MANAGER";

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    setUserRole(localStorage.getItem("role") || "");
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.clear();

    setToken(null);
    setProfileMenuOpen(false);
    setUserRole("");
    setCartItems([]); // 🧹 Clear cart state

    window.history.replaceState(null, "", "/");

    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }).catch(error => {
      console.error("Error logging out:", error);
    }).finally(() => {
      window.location.href = "/";
    });
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.history.replaceState(null, "", "/");
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      window.location.href = "/";
    }
  };

  const navTopStyle = {
    backgroundColor: "#1f1c66",
    padding: "0.5rem 1.5rem",
    height: "72px",
    display: "flex",
    alignItems: "center",
  };

  const navBottomStyle = {
    backgroundColor: "#1f1c66",
    marginTop: "3px",

  };

  const navBrandStyle = {
    transition: "transform 0.3s ease-in-out",
    fontWeight: "bold",
    fontSize: "1.75rem",
    color: "white",
    textDecoration: "none",
  };

  const profileBtnStyle = {
    height: "40px",
    width: "100%",
    justifyContent: "center",
  };

  const dropdownBoxStyle = {
    minWidth: "180px",
    top: "100%",
    left: 0,
    zIndex: 1050,
  };

  const dropdownLinkStyle = {
    whiteSpace: "nowrap",
    padding: "8px 16px",
    display: "block",
    fontWeight: 600,
    textDecoration: "none",
    color: "#212529",
    transition: "background-color 0.2s",
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={navTopStyle}>
        <div className="container d-flex justify-content-between align-items-center">
          <Link
            to="/"
            className="navbar-brand"
            style={navBrandStyle}
            onClick={handleLogoClick}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            NEPTUNE
          </Link>
          <Box sx={{ display: "flex", justifyContent: "center", flexGrow: 1 }}>
            <SearchBar />
          </Box>

          <div className="d-flex align-items-center gap-2">
            {token ? (
              <div
                className="position-relative d-flex justify-content-center align-items-center"
                onMouseEnter={() => setProfileMenuOpen(true)}
                onMouseLeave={() => setProfileMenuOpen(false)}
                style={{ width: "180px" }}
              >
                <button
                  className="btn btn-outline-light d-flex align-items-center gap-2"
                  style={profileBtnStyle}
                >
                  <AccountCircleIcon fontSize="small" />
                  <span>{"Account"}</span>
                </button>
                {profileMenuOpen && (
                  <div
                    className="position-absolute bg-white shadow rounded border text-center"
                    style={dropdownBoxStyle}
                  >
                    {userRole === "SALES_MANAGER" || userRole === "PRODUCT_MANAGER" ? (
                      <Link
                        to={userRole === "SALES_MANAGER" ? "/salesdashboard" : "/productdashboard"}
                        className="d-block text-decoration-none text-dark fw-bold py-2"
                      >
                        Admin Interface
                      </Link>
                    ) : (
                      <div>
                        <Link
                          to="/profile"
                          className="d-block text-decoration-none text-dark fw-bold py-2"
                        >
                          View Profile
                        </Link>
                        <Link
                          to="/orderpage"
                          className="d-block text-decoration-none text-dark fw-bold py-2"
                        >
                          Order History
                        </Link>
                      </div>
                    )}
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
                  className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2 w-100"
                  style={{ height: "40px" }}
                >
                  <LoginIcon fontSize="small" />
                  <span>Login / Register</span>
                </Link>
              </div>
            )}

            {/* Wishlist kalp ikonu – müşteriler ve giriş yapmamış kullanıcılar için göster */}
            {(!token || isCustomer) && (
              /* -------- GİRİŞ YAPILMIŞSA -------- */
              token ? (
                <Link
                  to="/wishlist"
                  className="text-white fs-5"
                  style={{ marginLeft: 5, marginRight: 5 }}
                >
                  <Badge
                    badgeContent={favCount}
                    color="error"
                    overlap="rectangular"
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    sx={{ "& .MuiBadge-badge": { fontSize: "0.75rem", height: 18, minWidth: 18 } }}
                  >
                    {favCount > 0 ? (
                      <FavoriteIcon fontSize="medium" />
                    ) : (
                      <FavoriteBorderIcon fontSize="medium" />
                    )}
                  </Badge>
                </Link>
              ) : (
                /* -------- GİRİŞ YAPILMAMIŞSA -------- */
                <>
                  <IconButton
                    color="inherit"
                    onClick={() => setShowLoginInfo(true)}
                    sx={{ marginLeft: 1, marginRight: 1, color: "#fff" }}
                  >
                    <Badge
                      /* giriş yapılmadığı için favCount bilinmez; 0 gösterme */
                      badgeContent={0}
                      color="error"
                      overlap="rectangular"
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      sx={{ "& .MuiBadge-badge": { fontSize: "0.75rem", height: 18, minWidth: 18 } }}
                    >
                      <FavoriteBorderIcon fontSize="medium" />
                    </Badge>
                  </IconButton>

                  {/* “Log in to see your favorites” snackbar’ı */}
                  <Snackbar
                    open={showLoginInfo}
                    autoHideDuration={3000}
                    onClose={() => setShowLoginInfo(false)}
                    message="Log in to see your favorites"
                    anchorOrigin={{ vertical: "center", horizontal: "center" }}
                    ContentProps={{
                      sx: {
                        backgroundColor: "#1f1c66", // 🔴 istediğiniz rengi verebilirsiniz #d32f2f
                        color: "#fff",              // yazı rengi
                        fontWeight: "bold",
                      },
                    }}
                  />
                </>
              )
            )}



            {/* Show shopping cart icon only for customers or non-logged in users */}
            {!token || isCustomer ? (
              <Link to="/cart" className="text-white fs-5">
                <Badge
                  badgeContent={totalQty}
                  color="error"
                  showZero
                  overlap="rectangular"
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.75rem",
                      height: 18,
                      minWidth: 18,
                    },
                  }}
                >
                  <ShoppingCartIcon fontSize="medium" />
                </Badge>
              </Link>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Bottom Navbar */}
      <nav className="navbar navbar-expand-lg" style={navBottomStyle}>
        <div className="container d-flex flex-wrap justify-content-center">
          <ul className="navbar-nav d-flex flex-row flex-wrap gap-2">
            {loading ? (
              <li className="nav-item">
                <span className="nav-link text-white">Loading...</span>
              </li>
            ) : categories.length > 0 ? (
              categories
                .filter((cat) => cat.parentCategory === null)
                .map((category, index) => (
                  <li
                    key={index}
                    className="nav-item dropdown position-relative"
                    onMouseEnter={() => setActiveDropdown(index)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div style={{ position: "relative" }}>
                      <Link
                        className="nav-link text-white dropdown-toggle"
                        to={`/category/${category.categoryId}`}
                        style={{ cursor: "pointer" }}
                      >
                        {category.categoryName}
                      </Link>
                      {activeDropdown === index && (
                        <div
                          className="bg-white shadow rounded border position-absolute"
                          style={{
                            ...dropdownBoxStyle,
                            width: "200px",
                          }}
                        >
                          {categories
                            .filter(
                              (sub) =>
                                sub.parentCategory?.categoryId ===
                                category.categoryId
                            )
                            .map((sub, subIndex) => (
                              <Link
                                key={subIndex}
                                to={`/category/${sub.categoryId}`}
                                className="text-decoration-none"
                                style={dropdownLinkStyle}
                                onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#f1f1f1")
                                }
                                onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                                }
                              >
                                {sub.categoryName}
                              </Link>
                            ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))
            ) : (
              <li className="nav-item">
                <span className="nav-link text-white">No Categories Found!</span>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;