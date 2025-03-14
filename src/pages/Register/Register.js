import "./Register.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import ThreeDFrame from "../../components/ui/ThreeDFrame"; // Doğru import yolu

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Registration successful!");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Server error, please try again later.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="w-100" style={{ backgroundColor: "#1f1c66", padding: "20px 0" }}>
        <div className="container d-flex justify-content-start">
          <h2 className="text-white fw-bold text-uppercase neptune-logo">NEPTUNE</h2>
        </div>
      </header>

      <main className="flex-grow-1 d-flex flex-column align-items-center py-5 px-3">
        <div className="container bg-white p-5 rounded shadow-lg" style={{ maxWidth: "600px", width: "90%" }}>
          <h1 className="text-center fw-bold">Welcome to Neptune</h1>
          
          {/* 📌 3D Frame Effect for Subtitle */}
          <div className="d-flex justify-content-center my-3">
            <ThreeDFrame 
              text="Galaxy's Best Tech Gadgets at Unbeatable Prices!"
              textSize="1.5rem"
              textColor="#ffffff"
              fontFamily="Poppins, sans-serif"
              frameColor="#1f1c66"
              frameThickness="4px"
              depth="8px"
              padding="10px 20px"
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col">
                <input type="text" name="name" className="form-control" placeholder="Name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="col">
                <input type="text" name="surname" className="form-control" placeholder="Surname" value={formData.surname} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-3">
              <input type="email" name="email" className="form-control" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="mb-3 position-relative">
              <input type={showPassword ? "text" : "password"} name="password" className="form-control pe-5" placeholder="Password" value={formData.password} onChange={handleChange} required />
              <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y" onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
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
