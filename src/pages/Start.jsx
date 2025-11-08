import React from "react";
import { Link } from "react-router-dom";

const Start = () => {
  return (
    <div>
      <div>
        <div className="h-screen bg-cover bg-[url(https://res.cloudinary.com/dbfqvsrls/image/upload/v1759142172/Gemini_Generated_Image_d8bex7d8bex7d8be_z84brt.png)] pt-8 flex justify-between flex-col w-full">
          <img
            className="w-14 ml-8"
            src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
            alt=""
          />
          <div className="bg-white pb-7 py-4 px-4">
            <h2 className="text-3xl font-semibold">get started with user</h2>
            <Link to='/userlogin' className="flex items-center justify-center w-full bg-black text-white py-3 rounded mt-5">
              continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;
