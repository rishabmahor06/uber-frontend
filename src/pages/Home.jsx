import React, { useRef, useState, useContext, useEffect } from "react";
import { BsChevronCompactDown } from "react-icons/bs";
import LocationSearchPanel from "../components/LocationSearchPanel";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext.jsx";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import axios from "../utils/axios";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import LiveTracking from "../components/LiveTracking.jsx";
import logo from "../assets/speed-logo.png";

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);

  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);

  const [activeField, setActiveField] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState(null); // Default to 'car' to ensure we always have a valid value
  // const [vehicleType, setVehicleType] = useState(null); // Default to 'car' to ensure we always have a valid value
  const [suggestions, setSuggestions] = useState([]);
  const [ride, setRide] = useState(null);

  const { socket } = useContext(SocketContext);
  const { user, logout } = useContext(UserDataContext);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      socket.emit("leave", { userId: user._id, userType: "user" });
      socket.disconnect();
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    // Keep track of whether the socket is already connected
    let isSocketConnected = false;

    if (!user || !user._id || !socket) {
      return;
    }

    if (!isSocketConnected) {
      console.log("User joining socket:", user._id);
      socket.emit("join", { userId: user._id, userType: "user" });
      isSocketConnected = true;
    }

    // Cleanup function
    return () => {
      if (isSocketConnected) {
        socket.emit("leave", { userId: user._id, userType: "user" });
        isSocketConnected = false;
      }
    };
  }, [user?._id, socket]); // Only depend on user._id instead of entire user object

  socket.on("ride-confirmed", (data) => {
    console.log("Ride confirmed:", data);
    setWaitingForDriver(true);
    // setVehiclePanel(false);
    // setConfirmRidePanel(false);
    setVehicleFound(true);
    setRide(ride);
  });

  socket.on("ride-started", (data) => {
    console.log("Ride started:", data);
    setWaitingForDriver(false);
    navigate("/riding", { state: { ride } });
  });

  const handlePickupChange = async (e) => {
    setPickup(e.target.value);
    try {
      const input = e.target.value;
      if (!input || input.length < 3) {
        setPickupSuggestions([]);
        return;
      }

      const response = await axios.get("/maps/get-suggestions", {
        params: { input },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }); // normalize response to array of strings
      const data = response && response.data ? response.data : [];
      let list = [];
      if (Array.isArray(data)) {
        if (data.length > 0 && typeof data[0] === "object") {
          list = data.map(
            (it) => it.description || it.place_name || JSON.stringify(it)
          );
        } else {
          list = data;
        }
      } else if (data.predictions && Array.isArray(data.predictions)) {
        list = data.predictions.map((p) => p.description || p.place_name);
      }
      setPickupSuggestions(list);
    } catch (error) {
      console.error("error", error);
      // don't use res in frontend; just clear suggestions on error
      setPickupSuggestions([]);
    }
  };

  const handlerDestinationChange = async (e) => {
    const input = e.target.value;
    setDestination(input);
    try {
      if (!input || input.length < 3) {
        setDestinationSuggestions([]);
        return;
      }
      const response = await axios.get("/maps/get-suggestions", {
        params: { input },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = response && response.data ? response.data : [];
      let list = [];
      if (Array.isArray(data)) {
        if (data.length > 0 && typeof data[0] === "object") {
          list = data.map(
            (it) => it.description || it.place_name || JSON.stringify(it)
          );
        } else {
          list = data;
        }
      } else if (data.predictions && Array.isArray(data.predictions)) {
        list = data.predictions.map((p) => p.description || p.place_name);
      }
      setDestinationSuggestions(list);
    } catch (error) {
      console.error("error", error);
      setDestinationSuggestions([]);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  useGSAP(
    function () {
      if (panelOpen) {
        gsap.to(panelRef.current, {
          height: "70%",
          padding: 20,
          opacity: 1,
          display: "block",
          duration: 0.4,
        });
        gsap.to(panelCloseRef.current, {
          opacity: 1,
          duration: 0.3,
        });
      } else {
        gsap.to(panelRef.current, {
          height: "0%",
          padding: 0,
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            panelRef.current.style.display = "none";
          },
        });
        gsap.to(panelCloseRef.current, {
          opacity: 0,
          duration: 0.3,
        });
      }
    },
    [panelOpen]
  );

  useGSAP(
    function () {
      if (vehiclePanel) {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [vehiclePanel]
  );

  useGSAP(
    function () {
      if (confirmRidePanel) {
        gsap.to(confirmRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePanel]
  );

  useGSAP(
    function () {
      if (vehicleFound) {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(200%)",
        });
      }
    },
    [vehicleFound]
  );

  useGSAP(
    function () {
      if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [waitingForDriver]
  );

  async function findTrip() {
    try {
      setVehiclePanel(true);
      setPanelOpen(false);

      const response = await axios.get("/ride/get-fare", {
        params: { pickup, destination },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log(response.data);
      setFare(response.data);
    } catch (error) {
      // Close the vehicle panel since we can't proceed
      setVehiclePanel(false);
      setPanelOpen(true);

      // Show an alert with a user-friendly message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unable to calculate fare for this route";
      alert(errorMessage);

      // Log the full error for debugging
      console.error("Error finding trip:", error);
    }
  }

  async function createRide(vehicleTypeParam) {
    const vt = vehicleTypeParam || vehicleType;
    if (!pickup || !destination || !vt) {
      console.error("Missing required fields:", {
        pickup,
        destination,
        vehicleType: vt,
      });
      throw new Error("Please select pickup, destination, and vehicle type");
    }

    try {
      const response = await axios.post(
        "/ride/create",
        {
          pickup,
          destination,
          vehicleType: vt,
          userId: user?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Ride created:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to create ride:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  return (
    <div className="relative h-screen ">
      <div className="flex justify-between items-center absolute w-full px-5 py-5 z-50">
        <img className="w-10" src={logo} alt="" />
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
      <div className="h-screen w-screen">
        {/* <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        /> */}
        <LiveTracking />
      </div>
      <div className="absolute flex flex-col justify-end h-screen top-0 w-full ">
        <div className="h-[30%] p-5 mb-8 bg-white relative">
          <h5
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false);
            }}
            className="absolute opacity-0 right-5 top-5 text-xl"
          >
            <BsChevronCompactDown />
          </h5>
          <h4 className="text-2xl font-semibold mb-2">find a trip</h4>
          <form onSubmit={submitHandler}>
            <div className="line absolute h-18 w-1 rounded-2xl bg-gray-800 top-[35%] left-10 "></div>
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("pickup");
              }}
              value={pickup}
              onChange={handlePickupChange}
              className='bg-[#eeeeee] rounded w-full px-12 py-2 border-b-2 mb-5 text-base placeholder:text-sm"'
              type="text"
              placeholder="Enter pickup location"
            />
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("destination");
              }}
              value={destination}
              onChange={handlerDestinationChange}
              className='bg-[#eeeeee] rounded w-full px-12 py-2 border-b-2 mb-5 text-base placeholder:text-sm"'
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            onClick={findTrip}
            className="bg-[#000] flex items-center justify-center text-white mb-7 rounded px-4 py-2  w-full text-lg"
          >
            Find Trip
          </button>
        </div>
        <div ref={panelRef} className="h-[70%] bg-white hidden">
          <LocationSearchPanel
            suggestions={
              activeField === "pickup"
                ? pickupSuggestions
                : destinationSuggestions
            }
            setPanelOpen={setPanelOpen}
            setVehiclePanel={setVehiclePanel}
            setPickup={setPickup}
            setDestination={setDestination}
            activeField={activeField}
            query={activeField === "pickup" ? pickup : destination}
          />
        </div>

        <div
          ref={vehiclePanelRef}
          className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
        >
          <VehiclePanel
            selectVehicle={setVehicleType}
            fare={fare}
            createRide={createRide}
            setConfirmRidePanel={setConfirmRidePanel}
            setVehiclePanel={setVehiclePanel}
          />
        </div>

        <div
          ref={confirmRidePanelRef}
          className="fixed w-full z-10 bottom-0 translate-y-full  bg-white px-3 py-6 pt-12"
        >
          <ConfirmRide
            createRide={createRide}
            pickup={pickup}
            destination={destination}
            fare={fare}
            vehicleType={vehicleType}
            setVehiclePanel={setVehiclePanel}
            setConfirmRidePanel={setConfirmRidePanel}
            setVehicleFound={setVehicleFound}
          />
        </div>
        <div
          ref={vehicleFoundRef}
          className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12"
        >
          <LookingForDriver
            createRide={createRide}
            pickup={pickup}
            destination={destination}
            fare={fare}
            vehicleType={vehicleType}
            setVehicleFound={setVehicleFound}
          />
        </div>

        <div
          ref={waitingForDriverRef}
          className="fixed w-full z-10 bottom-0  bg-white px-3 py-6 pt-12"
        >
          <WaitingForDriver
            ride={ride}
            setVehicleFound={setVehicleFound}
            setWaitingForDriver={setWaitingForDriver}
            waitingForDriver={waitingForDriver}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
