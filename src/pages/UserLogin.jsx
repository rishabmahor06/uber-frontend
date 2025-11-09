import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast, { Toaster } from "react-hot-toast";
import { UserDataContext } from "../context/UserContext";

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
          <img
            className="w-16 mb-10"
            src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
            alt="Uber logo"
          />

          <form onSubmit={submitHandle} className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                What's Your Email
              </h3>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                autoComplete="username"
                disabled={isLoading}
                className="bg-gray-100 rounded-lg px-4 py-3 w-full text-base placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Enter Password
              </h3>
              <input
                type="password"
                required
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isLoading}
                className="bg-gray-100 rounded-lg px-4 py-3 w-full text-base placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-center mt-6 text-gray-700">
            New here?{" "}
            <Link to="/usersignup" className="text-blue-600 font-medium hover:underline">
              Create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8">
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
