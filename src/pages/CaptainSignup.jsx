import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

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
          <img
            className="w-14 mb-5 ml-1"
            src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
            alt=""
          />
          <form onSubmit={submitHandle}>
            <h3 className="text-base font-medium mb-2">Whats Captain Name</h3>
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
                className="bg-[#eeeeee] rounded px-4 py-2 border-b-2 w-1/2 text-base  placeholder:text-sm"
              />
            </div>
            <h3 className="text-lg font-medium mb-2">Whats Captain Email</h3>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="bg-[#eeeeee] mb-5 rounded px-4 py-2 border-b-2 w-full text-base placeholder:text-sm"
            />
            <h3 className="text-lg font-medium mb-2">Captain Password</h3>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="bg-[#eeeeee] mb-5 rounded px-4 py-2 border-b-2 w-full text-base placeholder:text-sm"
            />

            <h3 className="text-lg font-medium mb-2 ">vehicle information</h3>
            <div className="flex gap-4 mb-4 ">
              <input
                type="text"
                required
                className="bg-[#eeeeee]  placeholder:text-sm w-1/2 rounded-lg px-4 py-2 border-b-2 text-lg  "
                placeholder="vehicle color"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
              />
              <input
                type="text"
                required
                className="bg-[#eeeeee]  placeholder:text-sm  w-1/2 rounded-lg px-4 py-2 border-b-2 text-lg  "
                placeholder="vehicle plate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
              />
            </div>
            <div className="flex gap-4 mb-5">
              <input
                type="number"
                required
                className="bg-[#eeeeee]  placeholder:text-sm  w-1/2 rounded-lg px-4 py-2 border-b-2 text-lg  "
                placeholder="vehicle capicity"
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
              />
              <select
                type="text"
                required
                className="bg-[#eeeeee]  placeholder:text-sm  w-1/2 rounded-lg px-4 py-2 border-b-2 text-lg  "
                placeholder="vehicle type"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="" disabled>
                  select vehicle type
                </option>
                <option value="auto">auto</option>
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

export default CaptainSignup;
