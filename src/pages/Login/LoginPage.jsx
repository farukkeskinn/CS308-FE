import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/AuthNavbar";
import { useCartContext } from "../../context/CartContext";
import {
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError] = useState("");
  const [passwordError ] = useState("");
  const [loginError, setLoginError] = useState("");
  const { setCartItems } = useCartContext();
  const navigate = useNavigate();
  const mainColor = "#1f1c66";

  useEffect(() => {
    document.title = "Login - NEPTUNE";
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const fetchUserCart = async (customerId, jwtToken) => {
    try {
      const response = await fetch(`http://localhost:8080/api/cart-management/cart-by-customer/${customerId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
  
      if (!response.ok) {
        console.error("Cart fetch failed with status:", response.status);
        return;
      }
  
      const result = await response.json();
      console.log("📦 DB'den gelen sepet:", result);
  
      // ❗ ÖNEMLİ: result.shoppingCartItems'e göre context'i güncelle
      if (result.shoppingCartItems && Array.isArray(result.shoppingCartItems)) {
        const formattedCart = result.shoppingCartItems.map(item => ({
          productId: item.product.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          // image: item.product.image, // image yoksa yorumda kalabilir
          // stock: item.product.stock, // ihtiyaç varsa açılır
        }));
        
        setCartItems(formattedCart);
        localStorage.setItem("shoppingCart", JSON.stringify(formattedCart));
      } else {
        console.warn("Beklenen shoppingCartItems yok:", result);
      }
    } catch (error) {
      console.error("fetchUserCart hatası:", error);
    }
  };
  

const mergeGuestCart = async (customerId, jwtToken, guestCart) => {
  try {
    const response = await fetch("http://localhost:8080/api/cart-management/merge-guest-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        customerId,
        guestItems: guestCart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    });

    const result = await response.json();

    if (response.ok && result.clearGuestCart) {
      localStorage.removeItem("shoppingCart");
      setCartItems([]);
      await fetchUserCart(customerId, jwtToken);
    }
  } catch (err) {
    console.error("Merge işlemi başarısız:", err);
  }
};

const handleLogin = async (e) => {
  e.preventDefault();
  setLoginError(false);

  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response data:", data);

    if (response.ok) {
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("customerId", data.customerId);
      localStorage.setItem("userRole", data.role);

      const guestCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

      if (guestCart.length > 0) {
        await mergeGuestCart(data.customerId, data.token, guestCart);
      } else {
        await fetchUserCart(data.customerId, data.token);
      }

      navigate("/");
    } else {
      setLoginError(true);
    }
  } catch (error) {
    console.error("Login hatası:", error);
    setLoginError(true);
  }
};


  return (
    <div className="d-flex flex-column min-vh-100">
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      <Navbar />

      <main className="flex-grow-1 d-flex flex-column align-items-center pt-5 px-3">
        <div
          className="container bg-white p-5 rounded shadow-lg"
          style={{ maxWidth: "600px", width: "90%" }}
        >
          <h1 className="text-center mb-4 fw-bold">Welcome to NEPTUNE</h1>

          <div className="d-flex justify-content-center mb-4">
            <div className="px-4 py-2 rounded">Please Login Your Credentials</div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
              />
            </div>

            <div className="mb-3">
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <Button
              variant="contained"
              fullWidth
              type="submit"
              color={loginError ? "error" : "primary"}
              sx={{
                backgroundColor: loginError ? "#d32f2f" : mainColor,
                "&:hover": {
                  animation: "bounce 0.5s ease infinite",
                  backgroundColor: loginError ? "#b71c1c" : mainColor,
                },
                mt: 1,
                fontWeight: "bold",
              }}
            >
              Login
            </Button>

            {loginError && (
              <Typography
                variant="body2"
                color="error"
                align="center"
                sx={{ mt: 2, fontWeight: 500 }}
              >
                Invalid email or password!
              </Typography>
            )}

            <div className="text-center pt-3">
              <Link
                to="/register"
                className="text-decoration-none"
                style={{ color: mainColor, fontWeight: "bold" }}
              >
                Not registered yet? ✨
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="footer bg-dark text-white text-center py-3 mt-auto">
        &copy; 2025 Neptune. All rights reserved.
      </footer>
    </div>
  );
}