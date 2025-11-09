import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast, { Toaster } from "react-hot-toast";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { captain, setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  const submitHandle = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
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

        toast.success("Welcome back, Captain! 🚗");

        // Navigate after showing toast
        setTimeout(() => {
          navigate("/captain-home");
        }, 1000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(msg);

      // Clear password on error
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#000",
            fontWeight: "500",
            borderRadius: "12px",
            padding: "16px",
          },
        }}
      />

      <div className="max-w-md mx-auto px-6 py-8 min-h-screen flex flex-col justify-between">
        <div className="flex-1">
          {/* Logo Section */}

          <div className="">
            <img
              className="w-16 h-16 object-contain"
              src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
              alt="Uber Logo"
            />
          </div>

          {/* Title Section */}
          <div className="">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
              Captain Login
            </h1>
            
          </div>

          {/* Form Section */}
          <form onSubmit={submitHandle} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="captain@example.com"
                disabled={isLoading}
                className="bg-white rounded-xl px-4 py-3.5 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="bg-white rounded-xl px-4 py-3.5 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white font-bold rounded-xl py-4 text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] duration-200 mt-8"
            >
              {isLoading ? (
                <>
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                  Logging in...
                </>
              ) : (
                "Login as Captain"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Want to join our fleet?{" "}
              <Link
                to="/Captainsignup"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Register as a Captain
              </Link>
            </p>
          </div>
        </div>

        {/* User Login Button */}
        <div className="pb-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 font-medium">
                Not a captain?
              </span>
            </div>
          </div>

          <Link
            to="/userlogin"
            className="bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white flex items-center justify-center rounded-xl py-4 w-full text-lg font-bold transition-all shadow-md hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] duration-200"
          >
            Sign in as User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaptainLogin;
