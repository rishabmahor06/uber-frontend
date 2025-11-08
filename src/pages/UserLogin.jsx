import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

import { UserDataContext } from "../context/UserContext";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState({});

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  const [error, setError] = useState("");

  const submitHandle = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

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
          localStorage.setItem("userType", "user"); // To distinguish from captain
          localStorage.setItem("activeToken", "userToken"); // Set the active token type
        } catch (err) {
          console.error("Failed to persist user to localStorage:", err);
        }

        // Clear form
        setEmail("");
        setPassword("");

        // Navigate to home
        navigate("/home");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid email or password");
      setPassword(""); // Clear password on error

      // Log detailed error in development
      if (process.env.NODE_ENV === "development") {
        console.log("Detailed error:", err.response?.data);
      }
    }
  };
  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img
          className="w-14 mb-10 ml-1"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt=""
        />
        <form onSubmit={submitHandle}>
          <h3 className="text-lg font-medium mb-2">Wats Your Email</h3>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            autoComplete="username"
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          />
          <h3 className="text-lg font-medium mb-2">Enter Password</h3>
          <input
            type="password"
            required
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          />
          {error && (
            <div className="text-red-500 mb-3 text-sm text-center">{error}</div>
          )}
          <button className="bg-black text-white mb-3 rounded px-4 py-2  w-full text-lg ">
            Login
          </button>
        </form>
        <p className="text-center">
          New here?{" "}
          <Link to="/usersignup" className="text-blue-600">
            Create a new account
          </Link>
        </p>
      </div>
      <div>
        <Link
          to="/captainlogin"
          className="bg-[#10b461] flex items-center justify-center text-white mb-7 rounded px-4 py-2  w-full text-lg "
        >
          Sing in as Captain
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;
