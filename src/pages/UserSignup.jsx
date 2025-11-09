import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast, { Toaster } from "react-hot-toast";
import { UserDataContext } from "../context/UserContext";

const UserSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  const submitHandle = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newUser = {
      fullname: {
        firstname,
        lastname,
      },
      email,
      password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        newUser
      );

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);

        try {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
        } catch (err) {
          console.error("Failed to persist user to localStorage:", err);
        }

        toast.success("Account created successfully! 🎉");
        
        // Navigate after a short delay to show toast
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      }
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
      // Reset fields only after request is done
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
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
                What's Your Name
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  disabled={isLoading}
                  className="bg-gray-100 rounded-lg px-4 py-3 w-1/2 text-base placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  required
                  value={lastname}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  disabled={isLoading}
                  className="bg-gray-100 rounded-lg px-4 py-3 w-1/2 text-base placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

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
                autoComplete="new-password"
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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-700">
            Already have an account?{" "}
            <Link to="/userlogin" className="text-blue-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>

        <div className="flex gap-3 items-start mt-8">
          <input
            type="checkbox"
            id="consent"
            className="mt-1 w-4 h-4 accent-black cursor-pointer"
          />
          <label htmlFor="consent" className="text-xs leading-tight text-gray-600">
            By proceeding, you consent to get calls, WhatsApp or SMS messages,
            including by automated means, from Uber and its affiliates to the
            number provided.
          </label>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
