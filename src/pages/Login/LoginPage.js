import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";
import Navbar from "../../components/AuthNavbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - NEPTUNE";
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful!", data);

        localStorage.setItem("jwtToken", data.token);

        navigate("/");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 d-flex flex-column align-items-center pt-5 px-3">
        <div className="container bg-white p-5 rounded shadow-lg" style={{ maxWidth: "600px", width: "90%" }}>
          <h1 className="text-center mb-4 fw-bold text-custom">Welcome to NEPTUNE</h1>

          <div className="d-flex justify-content-center mb-4">
            <div className="px-4 py-2 rounded text-custom">
              Please Login Your Credentials
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form className="space-y-3" onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-3 position-relative">
              <label>Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-on-top position-absolute end-0 me-2 top-50 translate-middle-y"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn w-100 login-btn" style={{ backgroundColor: "#1f1c66", borderColor: "#1f1c66", color: "white" }}>
              Login
            </button>

            <div className="text-center pt-2">
              <Link 
                to="/register" 
                className="text-decoration-none"
                style={{ color: "#1f1c66", fontWeight: "bold" }}
              >
                Not registered yet? ✨
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer bg-dark text-white text-center py-3 mt-auto">
        &copy; 2025 Neptune. All rights reserved.
      </footer>
    </div>
  );
}
