import React, { useEffect, useState, useContext, useMemo } from "react";
import { LoadScript, GoogleMap } from "@react-google-maps/api";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";

// Define libraries array outside component to prevent unnecessary reloads
const libraries = ["marker"];

// Define static map styles
const mapStyles = {
  height: "100%",
  width: "100%",
};

// Define static map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  mapId: import.meta.env.VITE_GOOGLE_MAPS_ID || "b181ccc70f68f249",
};

const LiveTracking = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const { socket } = useContext(SocketContext) || {};
  const { user } = useContext(UserDataContext) || {};

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
        if (socket && user && user._id) {
          socket.emit("update-location-user", {
            userId: user._id,
            location: { ltd: latitude, lng: longitude },
          });
        }
      },
      (error) => {
        if (!mounted) return;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Please allow location access in your browser settings to use this feature."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Location information is unavailable. Please try again."
            );
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("An unknown error occurred. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!mounted) return;
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        if (socket && user && user._id) {
          socket.emit("update-location-user", {
            userId: user._id,
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
  }, [socket, user]);

  // Memoize the map marker callback
  const onMapLoad = useMemo(
    () => (map) => {
      if (window.google && currentPosition) {
        try {
          // First try to create an advanced marker
          if (
            window.google.maps.marker &&
            window.google.maps.marker.AdvancedMarkerElement
          ) {
            new window.google.maps.marker.AdvancedMarkerElement({
              position: currentPosition,
              map: map,
              title: "Current Location",
            });
          } else {
            // Fall back to regular marker if advanced markers are not available
            new window.google.maps.Marker({
              position: currentPosition,
              map: map,
              title: "Current Location",
            });
          }
        } catch (error) {
          console.warn(
            "Failed to create advanced marker, using regular marker:",
            error
          );
          new window.google.maps.Marker({
            position: currentPosition,
            map: map,
            title: "Current Location",
          });
        }
      }
    },
    [currentPosition]
  );

  // Show error message if location services are not supported or there's an error
  if (locationError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-500 max-w-md px-4 text-center">
          {locationError}
        </div>
      </div>
    );
  }
  // While waiting for the first fix
  if (!currentPosition) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        Acquiring location…
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
        "AIzaSyATfVPLR3d-PEGN-bstevmX4j14pn7kABQ"
      }
      libraries={libraries}
      version="beta"
      loadingElement={
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-gray-600">Loading Maps...</div>
        </div>
      }
    >
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={15}
        center={currentPosition}
        options={mapOptions}
        onLoad={onMapLoad}
      />
    </LoadScript>
  );
};

export default LiveTracking;
