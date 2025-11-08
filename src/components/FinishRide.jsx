import React from "react";
import { BsChevronCompactDown } from "react-icons/bs";
import { IoLocationSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const FinishRide = (props) => {
  const navigate = useNavigate();
  const endRide = async () => {
    try {
      const response = await axios.post(
        "/ride/end-ride",
        {
          rideId: props.ride._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        // props.setFinishRidePanel(false);
        // props.setRidepanelpoUp(false);
        navigate("/captain-home");
      }
    } catch (error) {
      console.error("Error ending ride:", error);
    }
  };

  return (
    <div>
      <h6
        onClick={() => {
          props.setFinishRidePanel(false);
        }}
        className="p-1 text-center w-[93%] absolute top-0 left-44"
      >
        <BsChevronCompactDown className="text-2xl text-gray-500" />
      </h6>

      <h3 className="text-2xl font-semibold mb-5 ">finish this ride</h3>

      <div className="flex items-center justify-between  p-3 bg-yellow-400 rounded-lg mt-4">
        <div className="flex items-center gap-3 ">
          <img
            className="w-12 h-12 rounded-full object-cover "
            src="#"
            alt=""
          />
          <h2 className="text-lg font-medium">
            {props.ride?.user.fullname.firstname}
          </h2>
        </div>
        <h5 className="text-lg font-semibold">2.2 km </h5>
      </div>

      <div className=" flex gap-2 justify-between flex-col items-center"></div>
      <div className="w-full mt-5">
        <div>
          <div className="flex gap-5 items-center border-b-2 p-3 border-gray-200">
            <IoLocationSharp className="text-xl" />
            <div>
              <h3 className="text-lg font-medium">562/11</h3>
              <p className="text-sm -mt-1 text-gray-600">
                {props.ride?.pickup}
              </p>
            </div>
          </div>
        </div>
        <div>
          <div>
            <div className="flex gap-5 items-center border-b-2 p-3 border-gray-200">
              <IoLocationSharp className="text-xl" />
              <div>
                <h3 className="text-lg font-medium">562/11</h3>
                <p className="text-sm -mt-1 text-gray-600">
                  {props.ride?.destination}
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
                <h3 className="text-lg font-medium">{props.ride?.fare}</h3>
                <p className="text-sm -mt-1 text-gray-600">cash cash</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8  mb-5">
          <div className="flex gap-5 justify-between">
            <button
              onClick={endRide}
              className="w-full mt-5 flex text-lg justify-center bg-green-700 text-white font-semibold p-3 rounded-lg "
            >
              finish ride
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishRide;
