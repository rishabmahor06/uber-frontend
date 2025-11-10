import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast, { Toaster } from "react-hot-toast";
import { UserDataContext } from "../context/UserContext";
import logo from "../assets/speed-logo.png";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  const submitHandle = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/users/login", {
        email: email.trim(),
        password: password,
      });

      const { data } = response;

      if (data.success && data.token && data.user) {
        // Store user data
        setUser(data.user);

        try {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userToken", data.token);
          localStorage.setItem("userType", "user");
          localStorage.setItem("activeToken", "userToken");
        } catch (err) {
          console.error("Failed to persist user to localStorage:", err);
        }

        toast.success("Welcome back! 👋");

        // Clear form
        setEmail("");
        setPassword("");

        // Navigate after showing toast
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        toast.error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Invalid email or password");
      setPassword(""); // Clear password on error

      // Log detailed error in development
      if (import.meta.env.DEV) {
        console.log("Detailed error:", err.response?.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="p-7 min-h-screen flex flex-col justify-between">
        <div className="flex-1">
          <div>
            <img className="w-12 mb-10" src={logo} alt="Uber logo" />
          </div>
          <div className="flex justify-center items-start ">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
              User Login
            </h1>
          </div>

          <form onSubmit={submitHandle} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                autoComplete="username"
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
                type="password"
                required
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isLoading}
                className="bg-white rounded-xl px-4 py-3.5 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white rounded-lg px-4 py-3 w-full text-lg font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-gray-700">
            New here?{" "}
            <Link
              to="/usersignup"
              className="text-blue-600 font-medium hover:underline"
            >
              Create a new account
            </Link>
          </p>
        </div>

        <div className="mb-8">
          <Link
            to="/captainlogin"
            className="bg-[#10b461] flex items-center justify-center text-white rounded-lg px-4 py-3 w-full text-lg font-semibold hover:bg-[#0ea152] transition-all"
          >
            Sign in as Captain
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
