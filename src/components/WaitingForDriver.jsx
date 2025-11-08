import React from "react";
import { BsChevronCompactDown } from "react-icons/bs";
import { IoLocationSharp } from "react-icons/io5";

const WaitingForDriver = (props) => {
  // Safely extract captain and vehicle info
  const captain = props.ride?.captain || {};
  const fullname = captain.fullname || {};
  const firstName = fullname.firstname || "";
  const lastName = fullname.lastname || "";
  const displayName = (firstName + " " + lastName).trim() || "Captain";
  const vehicle = captain.vehicle || {};
  const plate = vehicle.plate || "";

  return (
    <div>
      <h6
        onClick={() => {
          props.waitingForDriver(false);
        }}
        className="p-1 text-center w-[93%] absolute top-0 left-44"
      >
        <BsChevronCompactDown className="text-2xl text-gray-500" />
      </h6>

      <div className=" flex gap-2 justify-between items-center">
        <img
          className="h-12"
          src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1743773253/assets/5e/8ce23d-35fa-425d-a7d2-08a2826d04bc/original/UberBlackXL.png"
          alt=""
        />{" "}
        <div className="text-right">
          <h2 className="text-lg font-medium">{displayName}</h2>
          <h4 className="font-semibold -mt-1 -mb-1">{plate}</h4>
          <p className="text-sm text-gray-600">TVS NTORQ</p>
          <h2 className="text-lg font-semibold">{props.ride?.otp}</h2>
        </div>
      </div>
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
      </div>
    </div>
  );
};

export default WaitingForDriver;
