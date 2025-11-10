import React, { useRef, useState, useEffect, useContext } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import CaptainDetails from "../components/CaptainDetails";
import RidePopUp from "../components/RidePopUp";
import CaptainLiveTracking from "../components/CaptainLiveTracking";
import gsap from "gsap";
import axios from "../utils/axios";
import { useGSAP } from "@gsap/react";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import { SocketContext } from "../context/SocketContext";
import { CaptainDataContext } from "../context/CaptainContext";
import logo from "../assets/speed-logo.png";
import { IoLogOut } from "react-icons/io5";


const CaptainHome = () => {
  const [ridePanelPopUp, setRidepanelpoUp] = useState(false);
  const [confirmRidePanelPopUp, setConfirmRidepanelPopUp] = useState(false);
  const [ride, setRide] = useState(null);
  const ridePanelPopUpRef = useRef(null);
  const confirmRidePanelPopUpRef = useRef(null);

  const { captain, logout } = useContext(CaptainDataContext);
  const { socket } = useContext(SocketContext);
  const [isLocationEnabled] = useState(true); // Always enable location tracking

  const navigate = useNavigate();
 

  useEffect(() => {
    if (!captain || !captain._id) return; // Prevent error if captain is not loaded
    socket.emit("join", { userId: captain._id, userType: "captain" });
  }, [captain, socket]);

  useEffect(() => {
    if (!isLocationEnabled || !captain || !captain._id) return;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const location = {
            ltd: position.coords.latitude,
            lng: position.coords.longitude,
          };
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: location,
          });
        });
      }
    };

    const locationInterval = setInterval(updateLocation, 10000);
    updateLocation();

    return () => clearInterval(locationInterval);
  }, [isLocationEnabled, captain, socket]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new ride requests
    socket.on("new-ride-request", (data) => {
      console.log("New ride request received:", data);
      setRide(data?.ride);
      // Show the ride request popup to the captain
      setRidepanelpoUp(true);
    });

    // Cleanup event listeners on unmount
    return () => {
      socket.off("new-ride-request");
    };
  }, [socket]);

  const [otpPanelOpen, setOtpPanelOpen] = useState(false);
  const [otp, setOtp] = useState("");

  async function confirmRide() {
    try {
      // Debug log current state
      console.log("Current state before confirming ride:", {
        ride,
        captain,
        token: localStorage.getItem("captainToken"),
      });

      // Enhanced validation with detailed error messages
      if (!ride) {
        throw new Error("No ride data available");
      }

      if (!ride._id) {
        throw new Error("Invalid ride: missing ride ID");
      }

      if (!captain) {
        throw new Error("No captain data available");
      }

      if (!captain._id) {
        throw new Error("Invalid captain: missing captain ID");
      }

      const token = localStorage.getItem("captainToken");
      if (!token) {
        // Check if user might be accidentally logged in as user instead of captain
        const userToken = localStorage.getItem("userToken");
        if (userToken) {
          throw new Error(
            "You are logged in as a user. Please log in as a captain."
          );
        }
        throw new Error(
          "Captain authentication token not found. Please log in again."
        );
      }

      // Log request payload
      console.log("Sending ride confirmation request:", {
        rideId: ride._id,
        captainId: captain._id,
      });

      // Make API call
      const response = await axios.post(
        "/ride/confirm",
        {
          rideId: ride._id,
          captainId: captain._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("captainToken")}`,
          },
        }
      );

      // Validate response
      if (!response?.data) {
        throw new Error("Server returned empty response");
      }

      // Log response data
      console.log("Server response:", response.data);

      // Create confirmed ride object with all required fields
      const confirmedRide = {
        ...ride, // Keep existing ride data
        ...response.data, // Override with server response
        _id: ride._id, // Ensure ride ID is preserved
        captain: captain._id, // Ensure captain is set
        status: "confirmed", // Set status
        user: ride.user, // Preserve user data
        otp: response.data.otp || "", // Make sure OTP is included with fallback
        pickup: ride.pickup, // Preserve pickup location
        destination: ride.destination, // Preserve destination
        fare: ride.fare, // Preserve fare
        distance: ride.distance, // Preserve distance
      };

      // Log the final ride object
      console.log("Final confirmed ride data:", confirmedRide);

      // Update UI state
      setRide(confirmedRide);
      setRidepanelpoUp(false);
      setConfirmRidepanelPopUp(true);

      // Notify user through socket if available
      if (socket?.connected) {
        socket.emit("ride-confirmed", { ride: confirmedRide });
      } else {
        console.warn("Socket not connected, skipping notification");
      }

      return confirmedRide;
    } catch (error) {
      // Enhanced error logging
      console.error("Failed to confirm ride:", {
        error,
        response: error.response?.data,
        status: error.response?.status,
        ride: ride,
        captain: captain,
      });

      // Show appropriate error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to confirm ride";

      alert(errorMessage);

      // Reset UI state on error
      setRidepanelpoUp(true);
      setConfirmRidepanelPopUp(false);

      // Re-throw error for handling up the chain if needed
      throw error;
    }
  }

  async function startRide() {
    try {
      // Validate all required data
      if (!ride?._id) {
        throw new Error("No active ride found");
      }

      if (!captain?._id) {
        throw new Error("Captain information not available");
      }

      // Log current state for debugging
      console.log("Current state:", {
        ride: ride,
        captain: captain._id,
        otp: otp,
      });

      // Check ride status and captain assignment
      if (!ride.status || ride.status !== "confirmed") {
        throw new Error("Ride must be confirmed before starting");
      }

      if (!ride.captain || ride.captain.toString() !== captain._id.toString()) {
        throw new Error("This ride hasn't been accepted by you");
      }

      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      // Make API call without template literal
      const token = localStorage.getItem("captainToken");
      if (!token) {
        throw new Error(
          "Captain authentication token not found. Please log in again."
        );
      }

      const response = await axios.get("/ride/start-ride", {
        params: {
          rideId: ride._id,
          otp: otp,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response?.data) {
        throw new Error("No response data received");
      }

      // Update ride with started status
      const startedRide = {
        ...response.data,
        status: "started",
      };

      // Update state and UI
      setRide(startedRide);
      setOtpPanelOpen(false);
      setConfirmRidepanelPopUp(false);

      // Navigate with the updated ride data
      navigate("/captain-riding", { state: { ride: startedRide } });

      // Notify user
      socket?.emit("ride-started", { ride: startedRide });

      console.log("Ride started successfully:", startedRide);
    } catch (error) {
      console.error("Failed to start ride:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to start ride";
      alert(errorMessage);

      // Handle specific error cases
      if (errorMessage.toLowerCase().includes("otp")) {
        setOtp("");
      }

      if (
        errorMessage.includes("hasn't been accepted") ||
        errorMessage.includes("must be confirmed")
      ) {
        setOtpPanelOpen(false);
        setConfirmRidepanelPopUp(true);
      }
    }
  }

  useEffect(() => {
    const panel = ridePanelPopUpRef.current;
    if (!panel) return;

    gsap.to(panel, {
      y: ridePanelPopUp ? 0 : "100%",
      duration: 0.3,
      ease: "power2.inOut",
    });
  }, [ridePanelPopUp]);

  return (
    <div className="h-screen">
      <div className="fixed p-3 top-0 flex items-center justify-between w-full">
        {/* <img
          className="w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt=""
        /> */}
        <img className="w-10" src={logo} alt="" />
        <button
          onClick={async () => {
            try {
              socket.emit("leave", {
                userId: captain._id,
                userType: "captain",
              });
              socket.disconnect();
              await logout();
              navigate("/");
            } catch (error) {
              console.error("Logout failed:", error);
            }
          }}
          className="bg-gray-50 p-2 rounded-lg   hover:bg-red-100 hover:text-red-500  transition-colors duration-200"
        >
          <IoLogOut  className="text-3xl"/>
        </button>
      </div>
      <div className="h-3/5">
        <CaptainLiveTracking />
      </div>

      <div className="h-2/5 p-6">
        <CaptainDetails />
      </div>

      {/* Ride Request Panel */}
      {ride && (
        <div
          ref={ridePanelPopUpRef}
          className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12"
          style={{ transform: "translateY(100%)" }}
        >
          <RidePopUp
            ride={ride}
            confirmRide={confirmRide}
            setRidepanelpoUp={setRidepanelpoUp}
            setConfirmRidepanelPopUp={setConfirmRidepanelPopUp}
          />
        </div>
      )}

      {/* Confirm Ride Panel */}
      {confirmRidePanelPopUp && (
        <div className="fixed w-full z-20 bottom-0 bg-white px-3 py-6 pt-12">
          <ConfirmRidePopUp
            ride={ride}
            setConfirmRidepanelPopUp={setConfirmRidepanelPopUp}
            setRidepanelpoUp={setRidepanelpoUp}
            setOtpPanelOpen={setOtpPanelOpen}
          />
        </div>
      )}

      {/* OTP Panel */}
      {otpPanelOpen && (
        <div className="fixed w-full z-20 bottom-0 bg-white px-3 py-6 pt-12">
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">
              Enter OTP to Start Ride
            </h3>
            {ride?.otp && (
              <p className="text-base text-gray-600 mb-4">
                Ask the user for OTP: <strong>{ride.otp}</strong>
              </p>
            )}
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full p-2 border rounded mb-4"
              maxLength="6"
            />
            <button
              onClick={startRide}
              className="w-full bg-black text-white py-2 rounded-lg"
              disabled={otp.length !== 6}
            >
              Start Ride
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptainHome;
