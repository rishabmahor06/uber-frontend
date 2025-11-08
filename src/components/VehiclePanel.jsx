import React from "react";
import { FaUser } from "react-icons/fa";
import { BsChevronCompactDown } from "react-icons/bs";

const VehiclePanel = (props) => {
  const handleVehicleSelect = (type) => {
    props.selectVehicle(type);
    props.setVehiclePanel(false);
    props.setConfirmRidePanel(true);
  };

  return (
    <div>
      <h6
        onClick={() => {
          props.setVehiclePanel(false);
        }}
        className="p-1 text-center w-[93%] absolute top-0 left-44"
      >
        <BsChevronCompactDown className="text-2xl text-gray-500" />
      </h6>
      <h3 className="text-2xl font-semibold mb-5 ">Select your ride</h3>
      <div
        onClick={() => handleVehicleSelect("car")}
        className="flex w-full p-3 items-center mb-2 justify-between border-2 active:border-black bg-gray-100 rounded-xl hover:border-black cursor-pointer"
      >
        <img
          className="h-12"
          src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=552/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8zMDUxZTYwMi0xMGJiLTRlNjUtYjEyMi1lMzk0ZDgwYTljNDcucG5n"
          alt="UberGo"
        />
        <div className="w-1/2">
          <h4 className="font-medium text-sm flex gap-1">
            UberGo
            <span className="flex justify-center items-center gap-1">
              <FaUser className="text-xs" />4
            </span>
          </h4>
          <h5 className="font-medium text-sm">2 mins away</h5>
          <p className="font-normal text-xs text-gray-600">
            Affordable, compact rides
          </p>
        </div>
        <h2 className="text-xl font-semibold">₹{props.fare.car}</h2>
      </div>
      <div
        onClick={() => handleVehicleSelect("auto")}
        className="flex w-full p-3 items-center mb-2 justify-between border-2 active:border-black bg-gray-100 rounded-xl hover:border-black cursor-pointer"
      >
        <img
          className="h-12"
          src="https://clipart-library.com/2023/Uber_Auto_312x208_pixels_Mobile.png"
          alt="UberAuto"
        />
        <div className="w-1/2">
          <h4 className="font-medium text-sm flex gap-1">
            UberAuto
            <span className="flex justify-center items-center gap-1">
              <FaUser className="text-xs" />3
            </span>
          </h4>
          <h5 className="font-medium text-sm">2 mins away</h5>
          <p className="font-normal text-xs text-gray-600">
            Affordable auto rides
          </p>
        </div>
        <h2 className="text-xl font-semibold">₹{props.fare.auto}</h2>
      </div>
      <div
        onClick={() => handleVehicleSelect("moto")}
        className="flex w-full p-3 items-center mb-2 justify-between border-2 active:border-black bg-gray-100 rounded-xl hover:border-black cursor-pointer"
      >
        <img
          className="h-12"
          src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8yYzdmYTE5NC1jOTU0LTQ5YjItOWM2ZC1hM2I4NjAxMzcwZjUucG5n"
          alt="Moto"
        />
        <div className="w-1/2">
          <h4 className="font-medium text-sm flex gap-1">
            Moto
            <span className="flex justify-center items-center gap-1">
              <FaUser className="text-xs" />1
            </span>
          </h4>
          <h5 className="font-medium text-sm">2 mins away</h5>
          <p className="font-normal text-xs text-gray-600">Quick bike rides</p>
        </div>
        <h2 className="text-xl font-semibold">₹{props.fare.moto}</h2>
      </div>
    </div>
  );
};

export default VehiclePanel;
