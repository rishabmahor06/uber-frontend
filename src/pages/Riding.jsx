import React, { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoLocationSharp } from "react-icons/io5";
import axios from "../utils/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import LiveTracking from "../components/LiveTracking";

const Riding = () => {
  const location = useLocation();
  const { ride } = location.state || {};
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  // Listen for ride ended event from server
  socket.on("ride-ended", () => {
    navigate("/home");
  });

  return (
    <div className="h-screen">
      <Link className="fixed right-2 top-2 h-10 w-10 bg-white text-center justify-center rounded-full"></Link>
      <div className="h-1/2">
        {/* <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        /> */}
        <LiveTracking />
      </div>

      <div className="h-1/2 p-4">
        <div className=" flex gap-2 justify-between items-center">
          <img
            className="h-20 "
            src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1743773253/assets/5e/8ce23d-35fa-425d-a7d2-08a2826d04bc/original/UberBlackXL.png"
            alt=""
          />{" "}
          <div className="text-right">
            <h2 className="text-lg font-medium">
              {ride?.captain.fullname.firstname}
            </h2>
            <h4 className="font-semibold -mt-1 -mb-1">
              {ride?.captain.vehicle.plate}
            </h4>
            <p className="text-sm text-gray-600">TVS NTORQ</p>
          </div>
        </div>

        <div className="w-full mt-5">
          <div>
            <div>
              <div className="flex gap-5 items-center border-b-2 p-3 border-gray-200">
                <IoLocationSharp className="text-xl" />
                <div>
                  <h3 className="text-lg font-medium">562/11</h3>
                  <p className="text-sm -mt-1 text-gray-600">
                    {ride?.destination}
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
                  <h3 className="text-lg font-medium">{ride?.fare}</h3>
                  <p className="text-sm -mt-1 text-gray-600">cash cash</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* {ride && (
          <div>
            <h2>Ride ID: {ride.id}</h2>
            <p>pickup location : {ride.pickup}</p>
            <p>pickup destination : {ride.destination}</p>
          </div>
        )} */}

        <button className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg ">
          Make a payment
        </button>
      </div>
    </div>
  );
};

export default Riding;
