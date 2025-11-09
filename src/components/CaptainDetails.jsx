import React, { useContext, useEffect } from "react";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainDetails = () => {
  const { captain, setCaptain } = useContext(CaptainDataContext);
  

  console.log("CaptainDetails render:", { captain });

  // Try to get captain from localStorage if context is empty
  useEffect(() => {
    if (!captain) {
      const storedCaptain = localStorage.getItem("captain");
      if (storedCaptain) {
        try {
          const parsedCaptain = JSON.parse(storedCaptain);
          setCaptain(parsedCaptain);
        } catch (err) {
          console.error("Failed to parse stored captain data:", err);
        }
      }
    }
  }, [captain, setCaptain]);

  // Always prepare display values, falling back to placeholders 
  const firstName = captain?.fullname?.firstname || "";
  const lastName = captain?.fullname?.lastname || "";
  const displayName = (firstName + " " + lastName).trim() || "Captain";
  const avatar =
    captain?.avatar ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0kSjTb8XolsShk0Ab50yKigE_YWh6EFy8Vw&s";

  // Show skeleton UI while loading but keep t
  const isLoading = !captain;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-2 ">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={avatar}
            alt={displayName}
          />
          <h4 className="text-lg font-medium capitalize ">{displayName}</h4>
        </div>
        <div>
          <h4 className="text-xl font-semibold ">$298.36</h4>
          <p className="text-sm font-medium text-gray-600">Earned</p>
        </div>
      </div>
      <div className="flex p-3 mt-8 bg-gray-100 rounded-xl justify-center gap-5 items-start">
        <div className="text-center">
          <i>time</i>
          <h5 className="text-3xl mb-2 font-medium ">10.2 </h5>
          <p className="text-sm text-gray-600">hours online</p>
        </div>
        <div className="text-center">
          <i>speed</i>
          <h5 className="text-3xl mb-2 font-medium ">10.2 </h5>
          <p className="text-sm text-gray-600">hours online</p>
        </div>
        <div className="text-center">
          <i>notes</i>
          <h5 className="text-3xl mb-2 font-medium ">10.2 </h5>
          <p className="text-sm text-gray-600">hours online</p>
        </div>
      </div>
    </div>
  );
};

export default CaptainDetails;
