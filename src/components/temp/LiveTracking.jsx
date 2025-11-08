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


const VITE_GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  "AIzaSyATfVPLR3d-PEGN-bstevmX4j14pn7kABQ";
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_ID || "b181ccc70f68f249";

// Define static map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  mapId: import.meta.env.VITE_GOOGLE_MAPS_ID,
};


const LiveTracking = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [marker, setMarker] = useState(null);

  const { socket } = useContext(SocketContext) || {};
  const { user } = useContext(UserDataContext) || {};

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    let mounted = true;
    let watchId;

    const handlePositionUpdate = (position) => {
      if (!mounted) return;
      const { latitude, longitude } = position.coords;
      const newPosition = { lat: latitude, lng: longitude };
      setCurrentPosition(newPosition);

      if (socket && user && user._id) {
        socket.emit("update-location-user", {
          userId: user._id,
          location: { ltd: latitude, lng: longitude },
        });
      }

      // Update marker position if it exists
      if (marker) {
        marker.setPosition(newPosition);
      }
    };

    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      (error) => {
        if (!mounted) return;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Please allow location access in your browser settings."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchId = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (err) => console.warn("Error watching position:", err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      mounted = false;
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (marker) marker.setMap(null);
    };
  }, [socket, user, marker]);

  const onMapLoad = useMemo(
    () => async (map) => {
      if (!window.google || !currentPosition) return;

      try {
        // Try to load Advanced Markers
        const { AdvancedMarkerElement } = await google.maps.importLibrary(
          "marker"
        );

        const newMarker = new AdvancedMarkerElement({
          map,
          position: currentPosition,
          title: "Current Location",
        });

        setMarker(newMarker);
      } catch (error) {
        console.warn("Advanced marker failed, using standard marker:", error);

        // Fallback to standard marker
        const newMarker = new google.maps.Marker({
          map,
          position: currentPosition,
          title: "Current Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        setMarker(newMarker);
      }
    },
    [currentPosition]
  );

  if (locationError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-500 max-w-md px-4 text-center">
          {locationError}
        </div>
      </div>
    );
  }

  if (!currentPosition) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-600">Acquiring location…</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
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
    </div>
  );
};

export default LiveTracking;
