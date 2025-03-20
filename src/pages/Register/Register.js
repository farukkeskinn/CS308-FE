import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/AuthNavbar";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Register successful!", data);

        // ✅ JWT Tokeni kaydet
        localStorage.setItem("jwtToken", data.token);

        // ✅ Başarı mesajı göster
        setMessage("Registration successful! Redirecting...");

        // ✅ Ana sayfaya yönlendir
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Register failed:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 d-flex flex-column align-items-center py-5 px-3">
        <div className="container bg-white p-5 rounded shadow-lg" style={{ maxWidth: "600px", width: "90%" }}>
          <h1 className="text-center fw-bold text-custom">Welcome to Neptune</h1>
          
          <div className="d-flex justify-content-center mb-4">
            <div className="px-4 py-2 rounded text-custom">
              Create Your Account
            </div>
          </div>

          {/* ✅ Hata mesajı */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* ✅ Başarı mesajı */}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col">
                <label>Name</label>
                <input type="text" className="form-control" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="col">
                <label>Surname</label>
                <input type="text" className="form-control" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="mb-3">
              <label>Email address</label>
              <input type="email" className="form-control" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
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

            <button type="submit" className="btn w-100 signup-btn" style={{ backgroundColor: "#1f1c66", borderColor: "#1f1c66", color: "white" }}>
              Sign Up
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/login" className="text-primary text-decoration-none">Already signed up? 😊</Link>
          </div>
        </div>
      </main>

      <footer className="footer bg-dark text-white text-center py-3 mt-auto">
        &copy; 2025 Neptune. All rights reserved.
      </footer>
    </div>
  );
}
