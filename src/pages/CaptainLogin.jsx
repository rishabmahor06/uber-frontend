import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { captain, setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  const submitHandle = async (e) => {
    e.preventDefault();

    try {
      // Show loading state
      const loginBtn = e.target.querySelector('button[type="submit"]');
      if (loginBtn) loginBtn.textContent = "Logging in...";

      const res = await axios.post("/captain/login", {
        email: email.trim(),
        password: password,
      });

      console.log("Login response:", res.data);

      if (res.data?.token && res.data?.captain) {
        // Store token and captain data
        localStorage.setItem("captainToken", res.data.token);
        localStorage.setItem("userType", "captain");
        localStorage.setItem("captain", JSON.stringify(res.data.captain));

        // Update captain context
        setCaptain(res.data.captain);

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.token}`;

        // Store token type for API calls
        localStorage.setItem("activeToken", "captainToken");

        console.log("Captain data after login:", res.data.captain);

        // Navigate to home
        navigate("/captain-home");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      alert(msg);

      // Reset form on error
      setEmail("");
      setPassword("");
    } finally {
      // Reset button text
      const loginBtn = e.target.querySelector('button[type="submit"]');
      if (loginBtn) loginBtn.textContent = "Login";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto p-7 h-screen flex flex-col justify-between">
        <div>
          <img
            className="w-14 mb-10 ml-1 object-contain"
            src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
            alt="Uber Logo"
          />
          <form onSubmit={submitHandle} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Captain's Email</h3>
              <input
                type="email"
                required
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-gray-100 rounded-lg px-4 py-3 w-full text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Password</h3>
              <input
                type="password"
                required
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-gray-100 rounded-lg px-4 py-3 w-full text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-semibold rounded-lg py-3 text-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-gray-600">
            Want to join our fleet?{" "}
            <Link
              to="/Captainsignup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Register as a Captain
            </Link>
          </p>
        </div>
        <div className="mb-8">
          <Link
            to="/userlogin"
            className="bg-[#d5622d] hover:bg-[#c15628] flex items-center justify-center text-white rounded-lg py-3 w-full text-lg font-semibold transition-colors duration-200"
          >
            Sign in as User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaptainLogin;
