import React, { useContext } from "react";
import { BsChevronCompactDown } from "react-icons/bs";
import { IoLocationSharp } from "react-icons/io5";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

const ConfirmRide = (props) => {
  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);
  const navigate = useNavigate();
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

      <h3 className="text-2xl font-semibold mb-5 ">confirm Your Ride</h3>

      <div className=" flex gap-2 justify-between flex-col items-center">
        <img
          className="h-30"
          src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy81ZThjZTIzZC0zNWZhLTQyNWQtYTdkMi0wOGEyODI2ZDA0YmMucG5n"
          alt=""
        />{" "}
      </div>
      <div className="w-full mt-5">
        <div>
          <div className="flex gap-5 items-center border-b-2 p-3 border-gray-200">
            <IoLocationSharp className="text-xl" />
            <div>
              <h3 className="text-lg font-medium">562/11</h3>
              <p className="text-sm -mt-1 text-gray-600">{props.pickup}</p>
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
                  {props.destination}
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
                <h3 className="text-lg font-medium">
                  ₹{props.fare[props.vehicleType]}
                </h3>
                <p className="text-sm -mt-1 text-gray-600">Cash Cash</p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={async () => {
            if (!props.pickup || !props.destination || !props.vehicleType) {
              alert(
                "Please select pickup location, destination and vehicle type"
              );
              return;
            }

            if (!user || !user._id) {
              // avoid blocking alert; redirect user to login so they can authenticate
              console.warn("Attempted to create ride while unauthenticated");
              navigate("/userlogin");
              return;
            }

            try {
              const newRide = await props.createRide(props.vehicleType);
              console.log("New ride created:", newRide);

              // Emit the new ride request to all available captains
              socket.emit("new-ride-request", {
                ride: newRide,
                pickup: props.pickup,
                destination: props.destination,
                fare: props.fare[props.vehicleType],
                vehicleType: props.vehicleType,
              });

              // Show "Looking for Driver" panel to user
              props.setVehicleFound(true);
              props.setConfirmRidePanel(false);
            } catch (error) {
              console.error("Failed to create ride:", error);
              const errorMessage =
                error.response?.data?.message || "Failed to create ride";
              alert(errorMessage);

              // If user is not logged in, show appropriate message
              if (errorMessage.includes("userId")) {
                alert("Please make sure you are logged in and try again");
              }
            }
          }}
          className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg hover:bg-green-700"
          disabled={!props.pickup || !props.destination || !props.vehicleType}
        >
          Confirm Ride
        </button>
      </div>
    </div>
  );
};

export default ConfirmRide;
