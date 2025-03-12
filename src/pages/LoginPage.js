// filepath: c:\Users\pcadmin\Desktop\CS308-FE\src\pages\LoginPage.js
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import '../App.css';
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header with deep blue background */}
      <header className="w-100 bg-custom p-4">
        <div className="container d-flex justify-content-start">
          {/* Neptune text logo */}
          <div className="text-white h2 font-weight-bold">
            NEPTUNE
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow-1 d-flex flex-column align-items-center pt-5 px-3">
        <div className="container max-w-md w-100 bg-white p-4 rounded shadow">
          {/* Welcome message */}
          <h1 className="text-center mb-4">Welcome to Neptune</h1>

          {/* Only Login heading */}
          <div className="d-flex justify-content-center mb-4">
            <div className="px-4 py-2 rounded bg-custom text-white">
              Login
            </div>
          </div>

          {/* Login form */}
          <form className="space-y-3">
            <div className="form-group">
              <label>Email address</label>
              <input type="email" className="form-control" placeholder="Enter email" />
            </div>

            <div className="form-group position-relative">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter password"
              />
              <button
                type="button"
                className="btn btn-link position-absolute top-50 end-0 translate-middle-y"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>

            <button type="submit" className="btn btn-custom w-100">
              Login
            </button>

            {/* Not registered yet link */}
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