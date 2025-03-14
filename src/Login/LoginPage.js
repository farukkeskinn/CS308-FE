import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // ✅ Track login errors
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - Neptune";
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful!", data);
        navigate("/homepage"); // ✅ Redirect if login is successful
      } else {
        setError(data.message || "Invalid email or password"); // ✅ Show backend error message
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Something went wrong. Please try again."); // ✅ Handle server/network errors
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="w-100 bg-custom p-4">
        <div className="container d-flex justify-content-start">
          <Link to="/homepage">
            <img
              src="/Neptune Logo.png"
              alt="Neptune Logo"
              className="img-fluid transition-transform logo-hover"
              style={{ height: "50px" }}
            />
          </Link>
        </div>
      </header>

      <main className="flex-grow-1 d-flex flex-column align-items-center pt-5 px-3">
        <div className="container-fluid col-12 col-md-6 col-lg-4">
          <h1 className="text-center mb-4">Welcome to Neptune</h1>

          <div className="d-flex justify-content-center mb-4">
            <div className="px-4 py-2 rounded text-custom">
              Please Login Your Credentials
            </div>
          </div>

          {/* Show error message if login fails */}
          {error && <div className="alert alert-danger">{error}</div>}

          <form className="space-y-3" onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <label>Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
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
                  placeholder="Enter password"
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

            <button type="submit" className="btn btn-primary bg-custom w-100 mb-3 mt-4">
              Login
            </button>

            <div className="text-center pt-2">
              <Link to="/register" className="text-custom">
                Not registered yet? ✨
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
