import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

import { UserDataContext } from "../context/UserContext";

const UserSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [userData, setUserData] = useState({});

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  const submitHandle = async (e) => {
    e.preventDefault();
    const newuser = {
      fullname: {
        firstname: firstname,
        lastname: lastname,
      },
      email: email,
      password: password,
    };

    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/users/register`,
      newuser
    );

    if (response.status === 201) {
      const data = response.data;

      setUser(data.user);
      // persist user and token so provider can initialize from storage
      try {
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        console.error("Failed to persist user to localStorage:", err);
      }
      localStorage.setItem("token", data.token);

      navigate("/home");
    }
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  return (
    <div>
      <div className="p-7 h-screen flex flex-col justify-between">
        <div>
          <img
            className="w-14 mb-10 ml-1"
            src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
            alt=""
          />
          <form onSubmit={submitHandle}>
            <h3 className="text-base font-medium mb-2">Whats Your Name</h3>
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                required
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="bg-[#eeeeee] rounded px-4 py-2 border-b-2 w-1/2 text-base placeholder:text-sm"
              />
              <input
                type="text"
                required
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="bg-[#eeeeee] rounded px-4 py-2 border-b-2 w-1/2 text-base placeholder:text-sm"
              />
            </div>
            <h3 className="text-lg font-medium mb-2">Whats Your Email</h3>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="bg-[#eeeeee] mb-5 rounded px-4 py-2 border-b-2 w-full text-base placeholder:text-sm"
            />
            <h3 className="text-lg font-medium mb-2">Enter Password</h3>
            <input
              type="password"
              required
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-[#eeeeee] mb-5 rounded px-4 py-2 border-b-2 w-full text-base placeholder:text-sm"
            />
            <button className="bg-black text-white mb-3 rounded px-4 py-2  w-full text-lg ">
              Create Account
            </button>
          </form>
          <p className="text-center">
            Already have an account?{" "}
            <Link to="/userlogin" className="text-blue-600">
              Login
            </Link>
          </p>
        </div>
        <div className="flex gap-2 ">
          <input type="checkbox" />
          <p className="text-xs leading-tight text-justify">
            By procceding, your consent to get calls, Whatsapp or SMS messges,
            including by automated means, from Uber and its affiliates to the
            number provided.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
