import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/AuthNavbar";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [setError] = useState(""); // ✅ Track login errors
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, password }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          console.log("Register successful! Directing to Homepage", data);
          navigate("/");
        } else {
          setError(data.message); // ✅ Show backend error message
        }
      } catch (error) {
        console.error("Register failed:", error);
        setError("Something went wrong. Please try again."); // ✅ Handle server/network errors
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
              Please Login Your Credentials
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col">
                <label>Name</label>
                <input type="text" name="name" className="form-control" placeholder="Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="col">
                <label>Surname</label>
                <input type="text" name="surname" className="form-control" placeholder="Surname" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="mb-3">
              <label>Email address</label>
              <input type="email" name="email" className="form-control" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
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

            <button type="submit" className="btn w-100 signup-btn" style={{ backgroundColor: "#1f1c66", borderColor: "#1f1c66", color: "white" }}>Sign Up</button>
          </form>

          {message && <p className="text-center mt-3">{message}</p>}

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
