import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  IconButton,
  InputAdornment,
  Button,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Navbar from "../../components/AuthNavbar";

export default function RegisterPage() {
  const navigate = useNavigate();
  const mainColor = "#1f1c66";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Surname is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("jwtToken", data.token);
        setMessage("Registration successful! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setErrors({ email: data.message || "Registration failed." });
      }
    } catch (error) {
      console.error("Register failed:", error);
      setErrors({ email: "Something went wrong. Please try again." });
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

      <main className="flex-grow-1 d-flex flex-column align-items-center py-5 px-3">
        <div
          className="container bg-white p-5 rounded shadow-lg"
          style={{ maxWidth: "600px", width: "90%" }}
        >
          <h1 className="text-center mb-4 fw-bold">Welcome to NEPTUNE</h1>
          <div className="d-flex justify-content-center mb-4">
            <div className="px-4 py-2 rounded">Create Your Account</div>
          </div>

          {message && (
            <div className="alert alert-success text-center">{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col">
                <TextField
                  label="Name"
                  fullWidth
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </div>
              <div className="col">
                <TextField
                  label="Surname"
                  fullWidth
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </div>
            </div>

            <div className="mb-3">
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
              />
            </div>

            <div className="mb-4">
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={formData.password}
                onChange={handleChange("password")}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
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
              sx={{
                backgroundColor: mainColor,
                "&:hover": {
                  animation: "bounce 0.5s ease infinite",
                  backgroundColor: mainColor,
                },
                fontWeight: "bold",
              }}
            >
              Sign Up
            </Button>

            <div className="text-center mt-3">
              <Link
                to="/login"
                className="text-decoration-none"
                style={{ color: mainColor, fontWeight: "bold" }}
              >
                Already signed up? 😊
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