import React, { useState } from "react";
import PropTypes from "prop-types";
import { BsChevronCompactDown } from "react-icons/bs";
import { IoLocationSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const defaultRide = {
  _id: "",
  user: {
    _id: "",
    fullname: {
      firstname: "",
      lastname: "",
    },
  },
  pickup: "",
  destination: "",
  fare: 0,
  distance: 0,
  status: "pending",
};

const ConfirmRidePopUp = ({
  ride = defaultRide,
  setRidepanelpoUp,
  setConfirmRidepanelPopUp,
  setOtpPanelOpen,
}) => {
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get("/ride/start-ride", {
        params: {
          rideId: ride._id,
          otp: otp,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        alert("Ride started successfully");
        setConfirmRidepanelPopUp(false);
        setRidepanelpoUp(false);
        navigate("/captain-riding", { state: { ride } });
      } else {
        alert("Failed to start ride");
      }
    } catch (error) {
      console.error("Error starting ride:", error);
      alert(error.response?.data?.message || "Failed to start ride");
    }
  };
  return (
    <div>
      <h6
        onClick={() => setRidepanelpoUp(false)}
        className="p-1 text-center w-[93%] absolute top-0 left-44 cursor-pointer"
      >
        <BsChevronCompactDown className="text-2xl text-gray-500" />
      </h6>

      <h3 className="text-2xl font-semibold mb-5">
        Confirm this ride to start
      </h3>

      <div className="flex items-center justify-between  p-3 bg-yellow-400 rounded-lg mt-4">
        <div className="flex items-center gap-3 ">
          <img
            className="w-12 h-12 rounded-full object-cover"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0kSjTb8XolsShk0Ab50yKigE_YWh6EFy8Vw&s"
            alt="User"
          />
          <h2 className="text-lg font-medium">
            {ride?.user?.fullname?.firstname || "User"}
          </h2>
        </div>
        <h5 className="text-lg font-semibold">
          {ride?.distance ? `${ride.distance} km` : "2.2 km"}
        </h5>
      </div>

      <div className=" flex gap-2 justify-between flex-col items-center"></div>
      <div className="w-full mt-5">
        <div>
          <div className="flex gap-5 items-center border-b-2 p-3 border-gray-200">
            <IoLocationSharp className="text-xl" />
            <div>
              <h3 className="text-lg font-medium">562/11</h3>
              <p className="text-sm -mt-1 text-gray-600">
                {ride?.pickup || "Loading..."}
              </p>
            </div>
          </div>
        </div>
        <div>
          <div>
            <div className="flex gap-5 items-center border-b-2 p-3 border-gray-200">
              <IoLocationSharp className="text-xl" />
              <div>
                <h3 className="text-lg font-medium">Drop Location</h3>
                <p className="text-sm -mt-1 text-gray-600">
                  {ride?.destination || "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div>
            <div className="flex gap-5 items-center p-3">
              <IoLocationSharp className="text-xl" />
              <div>
                <h3 className="text-lg font-medium">₹{ride?.fare || "0"}</h3>
                <p className="text-sm -mt-1 text-gray-600">Cash Payment</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 mb-5">
          <div className="flex gap-5 justify-between">
            <button
              onClick={() => {
                setRidepanelpoUp(false);
                setConfirmRidepanelPopUp(false);
              }}
              className="w-full mt-5 bg-red-600 hover:bg-red-700 text-white font-semibold p-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setConfirmRidepanelPopUp(false);
                setOtpPanelOpen(true);
              }}
              className="w-full mt-5 flex justify-center bg-green-700 hover:bg-green-800 text-white font-semibold p-3 rounded-lg transition-colors"
            >
              Enter OTP to Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmRidePopUp.propTypes = {
  ride: PropTypes.shape({
    _id: PropTypes.string,
    user: PropTypes.shape({
      fullname: PropTypes.shape({
        firstname: PropTypes.string,
        lastname: PropTypes.string,
      }),
    }),
    pickup: PropTypes.string,
    destination: PropTypes.string,
    fare: PropTypes.number,
    distance: PropTypes.number,
  }),
  setRidepanelpoUp: PropTypes.func.isRequired,
  setConfirmRidepanelPopUp: PropTypes.func.isRequired,
  setOtpPanelOpen: PropTypes.func.isRequired,
};

export default ConfirmRidePopUp;
