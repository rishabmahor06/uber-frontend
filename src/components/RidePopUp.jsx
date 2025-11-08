import React from "react";
import PropTypes from "prop-types";
import { BsChevronCompactDown } from "react-icons/bs";
import { IoLocationSharp } from "react-icons/io5";

const defaultRide = {
  user: {
    fullname: {
      firstname: "",
      lastname: "",
    },
  },
  pickup: "",
  destination: "",
  fare: 0,
  distance: 0,
};

const RidePopUp = ({
  ride = defaultRide,
  setRidepanelpoUp,
  setConfirmRidepanelPopUp,
  confirmRide,
}) => {
  return (
    <div>
      <h6
        onClick={() => {
          setRidepanelpoUp(false);
        }}
        className="p-1 text-center w-[93%] absolute top-0 left-44 cursor-pointer"
      >
        <BsChevronCompactDown className="text-2xl text-gray-500" />
      </h6>

      <h3 className="text-2xl font-semibold mb-5 ">New Ride</h3>

      <div className="flex items-center justify-between  p-3 bg-yellow-400 rounded-lg mt-4">
        <div className="flex items-center gap-3 ">
          <img
            className="w-12 h-12 rounded-full object-cover "
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0kSjTb8XolsShk0Ab50yKigE_YWh6EFy8Vw&s"
            alt="User"
          />
          <h2 className="text-lg font-medium">
            {ride?.user?.fullname
              ? `${ride.user.fullname.firstname || ""} ${
                  ride.user.fullname.lastname || ""
                }`.trim()
              : "User"}
          </h2>
        </div>
        <h5 className="text-lg font-semibold">
          {ride?.distance ? `${ride.distance} km` : ""}
        </h5>
      </div>

      <div className=" flex gap-2 justify-between flex-col items-center"></div>
      <div className="w-full mt-5">
        <div>
          <div className="flex gap-5 items-center border-b-2 p-3 border-gray-200">
            <IoLocationSharp className="text-xl" />
            <div>
              <h3 className="text-lg font-medium">Pickup Location</h3>
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
        <div className="flex gap-5 justify-between ">
          <button
            onClick={() => setRidepanelpoUp(false)}
            className="w-full mt-5 bg-gray-400 text-gray-800 font-semibold p-2 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Cancle
          </button>
          <button
            onClick={async () => {
              try {
                // Check if captain token exists before attempting to confirm
                const captainToken = localStorage.getItem("captainToken");
                if (!captainToken) {
                  alert("Please log in again as a captain to accept rides.");
                  return;
                }

                await confirmRide();
                setConfirmRidepanelPopUp(true);
              } catch (error) {
                console.error("Ride confirmation failed:", error);

                // Show user-friendly error message
                const errorMessage = error.message.includes("token")
                  ? "Please log in again as a captain to accept rides."
                  : error.message ||
                    "Failed to confirm ride. Please try again.";

                alert(errorMessage);

                // If it's an authentication error, we might want to redirect to login
                if (
                  error.message.includes("token") ||
                  error.message.includes("authentication")
                ) {
                  window.location.href = "/captainlogin";
                }
              }
            }}
            className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

RidePopUp.propTypes = {
  ride: PropTypes.shape({
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
  confirmRide: PropTypes.func.isRequired,
};

export default RidePopUp;
