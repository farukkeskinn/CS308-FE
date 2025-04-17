import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/AuthNavbar";
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

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const navigate = useNavigate();
  const mainColor = "#1f1c66";

  useEffect(() => {
    document.title = "Login - NEPTUNE";
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setLoginError(false);

    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
      return;
    }
  
    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
      return;
    }

    if (hasError) return;

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
        navigate("/");
      } else {
        setLoginError(true);
      }
    } catch (error) {
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