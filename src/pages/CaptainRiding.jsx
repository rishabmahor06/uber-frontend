import React, { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BsChevronCompactUp } from "react-icons/bs";
import FinishRide from "../components/FinishRide";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import LiveTracking from "../components/LiveTracking";

const CaptainRiding = () => {

  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const finishRidePanelRef = useRef(null);
  const location = useLocation();
  const rideData= location.state?.ride




    useGSAP(
    function () {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [finishRidePanel]
  );



  return (
    <div className="h-screen ">
      <div className="fixed p-3 top-0 flex items-center justify-between w-full">
        <img
          className=" w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt=""
        />
        <Link className=" h-10 w-10   bg-white text-center justify-center rounded-full"></Link>
      </div>
      <div className="h-4/5 ">
        
        <LiveTracking />
      </div>

      <div onClick={()=>{
        setFinishRidePanel(true)
      }} className="h-1/5 flex items-center  gap-8 justify-center  bg-yellow-400">
        <h6
          onClick={() => {}}
          className="p-1 text-center font-bold w-[93%] absolute top-0"
        >
          <BsChevronCompactUp className="text-2xl  text-gray-800" />
        </h6>

        <h4 className="text-xl font-semibold">4 KM away</h4>
        <button className=" bg-green-700 text-white font-semibold p-3 px-10 rounded-lg">
          complete Ride
        </button>
      </div>

      <div
        ref={finishRidePanelRef}
        className="fixed w-full z-10 bottom-0 translate-y-full  bg-white px-3 py-6 pt-12"
      >
        <FinishRide 
        ride={rideData}
        setFinishRidePanel={setFinishRidePanel}
          
        />
      </div>
    </div>
  );
};

export default CaptainRiding;



