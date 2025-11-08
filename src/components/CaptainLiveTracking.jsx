import React, { useEffect, useState, useContext, useRef } from "react";
import { LoadScript, GoogleMap } from "@react-google-maps/api";
import { SocketContext } from "../context/SocketContext";
import { CaptainDataContext } from "../context/CaptainContext";

const libraries = ["marker"];
const mapStyles = { height: "100%", width: "100%" };
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  mapId: import.meta.env.VITE_GOOGLE_MAPS_ID,
};

const CaptainLiveTracking = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [map, setMap] = useState(null);
  const markerRef = useRef(null);
  const { socket } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    let mounted = true;
    let watchId;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mounted) return;
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        if (socket && captain && captain._id) {
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: { ltd: latitude, lng: longitude },
          });
        }
      },
      (error) => {
        if (!mounted) return;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Please allow location access in your browser settings to use this feature.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("An unknown error occurred. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!mounted) return;
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        if (socket && captain && captain._id) {
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: { ltd: latitude, lng: longitude },
          });
        }
      },
      (err) => console.warn("Error watching position:", err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => {
      mounted = false;
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, captain]);

  // Effect to manage AdvancedMarkerElement
  useEffect(() => {
    if (!map || !window.google || !window.google.maps?.marker?.AdvancedMarkerElement || !currentPosition) return;

    // Remove previous marker if exists
    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current = null;
    }

    // Create new AdvancedMarkerElement
    markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
      position: currentPosition,
      map: map,
      title: captain?.fullname?.firstname || "Captain",
    });

    // Cleanup on unmount
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, currentPosition, captain]);

  if (locationError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-500 max-w-md px-4 text-center">{locationError}</div>
      </div>
    );
  }
  if (!currentPosition) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-600">Getting your location...</div>
      </div>
    );
  }
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      version="weekly"
    >
      <div className="h-full w-full relative">
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={15}
          center={currentPosition || { lat: 26.449923, lng: 80.331871 }}
          options={mapOptions}
          onLoad={setMap}
        />
        {map && (
          <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md">
            <strong>Location Status:</strong> {currentPosition ? "Active" : "Acquiring..."}
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default CaptainLiveTracking;