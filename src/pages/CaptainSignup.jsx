import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/speed-logo.png";

const CaptainSignup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [userData, setUserData] = useState({});

  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const { captain, setCaptain } = useContext(CaptainDataContext);

  const submitHandle = async (e) => {
    e.preventDefault();
    const captainData = {
      fullname: {
        firstname: firstname,
        lastname: lastname,
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: Number(vehicleCapacity),
        vehicleType: vehicleType,
      },
    };

    const response = await axios.post("/captain/register", captainData);

    if (response.status === 201) {
      const data = response.data;
      setCaptain(data.captain);
      localStorage.setItem("token", data.token);
      navigate("/captain-home");
    }

    console.log(userData);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setVehicleCapacity("");
    setVehicleColor("");
    setVehiclePlate("");
    setVehicleType("");
  };

  return (
    <div>
      <div className="p-7 h-screen flex flex-col justify-between">
        <div>
          <img className="w-12 mb-2 ml-1" src={logo} alt="" />
          <form onSubmit={submitHandle}>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Enter Your Name
            </label>
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                required
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="bg-white rounded-xl px-4 py-3.5 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              />
              <input
                type="text"
                required
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="bg-white rounded-xl px-4 py-3.5 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              />
            </div>

            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Whats Captain Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="bg-white rounded-xl px-4 py-3.5 mb-3 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            />

            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Captain Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-white rounded-xl px-4 py-3.5 mb-3 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            />

            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              vehicle information
            </label>
            <div className="flex gap-4 mb-2 ">
              <input
                type="text"
                required
                className="bg-white rounded-xl px-4 py-3.5 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                placeholder="Vehicle Color"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
              />
              <input
                type="text"
                required
                className="bg-white rounded-xl px-4 py-3.5 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                placeholder="Vehicle Plate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
              />
            </div>
            <div className="flex gap-4 mb-5">
              <input
                type="number"
                required
                className="bg-white rounded-xl px-4 py-3.5 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                placeholder="Vehicle Capicity"
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
              />
              <select
                type="text"
                required
                className="bg-white rounded-xl px-4 py-3.5 w-full text-base border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                placeholder="vehicle type"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="" disabled>
                  Select Vehicle
                </option>
                <option value="auto">Auto</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>
            <button className="bg-black text-white mb-3 rounded px-4 py-2  w-full text-lg ">
              Creatre captain account
            </button>
          </form>
          <p className="text-center">
            Already have an account?{" "}
            <Link to="/captainlogin" className="text-blue-600">
              Login
            </Link>
          </p>
        </div>
        <div className="flex gap-2 mb-8 ">
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

export default CaptainSignup;
