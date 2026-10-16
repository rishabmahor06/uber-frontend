"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "@/lib/router";
import axios from "../utils/axios";
import { CaptainDataContext } from "../context/CaptainContext";
import useSocketJoin from "../hooks/useSocketJoin";
import useGeolocation from "../hooks/useGeolocation";
import { apiError, getRoute, haversineKm } from "../lib/maps";
import RideLayout from "../components/RideLayout";
import MapView from "../components/map/MapView";
import CaptainDetails from "../components/CaptainDetails";
import RidePopUp from "../components/RidePopUp";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import FinishRide from "../components/FinishRide";
import { RideComplete } from "../components/RideInProgress";

const pt = (c) => (c ? { lat: c.lat, lng: c.lng } : null);

// Captain screen: idle -> request -> pickup (OTP) -> riding -> completed
const CaptainHome = () => {
  const navigate = useNavigate();
  const { captain, logout } = useContext(CaptainDataContext);
  const socket = useSocketJoin(captain?._id, "captain");
  const { position: me, error: locError } = useGeolocation();

  const [requests, setRequests] = useState([]);
  const [ride, setRide] = useState(null);
  const [step, setStep] = useState("idle");
  const [trip, setTrip] = useState(null); // pickup -> destination route
  const [leg, setLeg] = useState(null); // captain -> pickup / destination
  const [busy, setBusy] = useState(false);

  const lastSent = useRef(0);
  const lastLegFrom = useRef(null);

  const handleLogout = async () => {
    try {
      socket?.emit("leave", { userId: captain?._id, userType: "captain" });
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    navigate("/captainlogin");
  };

  /* ---------- restore after refresh ---------- */
  useEffect(() => {
    if (!captain?._id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get("/ride/active-captain");
        const r = data.ride;
        if (!r || cancelled) return;
        setRide(r);
        setStep(r.status === "accepted" ? "pickup" : "riding");
        const route = await getRoute(pt(r.pickupCoords), pt(r.destinationCoords));
        if (!cancelled) setTrip(route);
      } catch (e) {
        console.error("Could not restore ride:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [captain?._id]);

  /* ---------- share live location (relayed to the rider during a ride) ---------- */
  useEffect(() => {
    if (!socket || !me || !captain?._id) return;
    const now = Date.now();
    if (now - lastSent.current < 3000) return;
    lastSent.current = now;
    socket.emit("update-location-captain", {
      userId: captain._id,
      location: { lat: me.lat, lng: me.lng },
      rideId: ride && ["pickup", "riding"].includes(step) ? ride._id : undefined,
    });
  }, [me, socket, captain?._id, ride, step]);

  /* ---------- socket events ---------- */
  useEffect(() => {
    if (!socket) return;
    const onNew = (data) => {
      setRequests((list) =>
        list.some((r) => r._id === data._id) ? list : [...list, data]
      );
      try {
        navigator.vibrate?.([200, 100, 200]);
      } catch {}
    };
    const onTaken = ({ rideId }) =>
      setRequests((list) => list.filter((r) => r._id !== rideId));
    const onCancelled = ({ rideId }) => {
      setRide((current) => {
        if (current && current._id === rideId) {
          toast.error("The rider cancelled this ride");
          setStep("idle");
          setTrip(null);
          setLeg(null);
          return null;
        }
        return current;
      });
    };
    socket.on("new-ride", onNew);
    socket.on("ride-taken", onTaken);
    socket.on("ride-cancelled", onCancelled);
    return () => {
      socket.off("new-ride", onNew);
      socket.off("ride-taken", onTaken);
      socket.off("ride-cancelled", onCancelled);
    };
  }, [socket]);

  /* ---------- live leg: me -> pickup / destination ---------- */
  useEffect(() => {
    if (!me || !ride || !["pickup", "riding"].includes(step)) return;
    const moved = lastLegFrom.current
      ? haversineKm(lastLegFrom.current, me) * 1000
      : Infinity;
    if (moved < 150) return;
    lastLegFrom.current = me;
    const target = step === "pickup" ? pt(ride.pickupCoords) : pt(ride.destinationCoords);
    if (!target) return;
    getRoute(me, target)
      .then(setLeg)
      .catch(() => {});
  }, [me, step, ride]);

  /* ---------- actions ---------- */
  const accept = async (r) => {
    setBusy(true);
    try {
      const { data } = await axios.post("/ride/confirm", { rideId: r._id });
      setRide(data);
      setRequests([]);
      setStep("pickup");
      lastLegFrom.current = null;
      setLeg(null);
      getRoute(pt(data.pickupCoords), pt(data.destinationCoords))
        .then(setTrip)
        .catch(() => {});
      toast.success("Ride accepted — head to the pickup");
    } catch (err) {
      toast.error(apiError(err, "Couldn't accept this ride"));
      setRequests((list) => list.filter((x) => x._id !== r._id));
    } finally {
      setBusy(false);
    }
  };

  const startRide = async (otp) => {
    setBusy(true);
    try {
      const { data } = await axios.get("/ride/start-ride", {
        params: { rideId: ride._id, otp },
      });
      setRide((r) => ({ ...r, ...data }));
      setStep("riding");
      lastLegFrom.current = null;
      setLeg(null);
      toast.success("Ride started");
    } catch (err) {
      toast.error(apiError(err, "Invalid OTP"));
    } finally {
      setBusy(false);
    }
  };

  const finishRide = async () => {
    setBusy(true);
    try {
      const { data } = await axios.post("/ride/end-ride", { rideId: ride._id });
      setRide((r) => ({ ...r, ...data }));
      setStep("completed");
      setLeg(null);
    } catch (err) {
      toast.error(apiError(err, "Couldn't finish the ride"));
    } finally {
      setBusy(false);
    }
  };

  const done = () => {
    setRide(null);
    setTrip(null);
    setLeg(null);
    setStep("idle");
  };

  /* ---------- derived UI ---------- */
  const request = step === "idle" ? requests[0] : null;
  const pickupKm =
    request && me ? haversineKm(me, pt(request.pickupCoords)) : null;

  // what the map shows
  let pickupPoint = null;
  let destPoint = null;
  let route = null;
  let approach = null;
  let fit = [];
  if (request) {
    pickupPoint = pt(request.pickupCoords);
    destPoint = pt(request.destinationCoords);
    fit = [pickupPoint, destPoint, me].filter(Boolean).map((p) => [p.lat, p.lng]);
  } else if (ride && ["pickup", "riding", "completed"].includes(step)) {
    pickupPoint = pt(ride.pickupCoords);
    destPoint = pt(ride.destinationCoords);
    route = trip?.geometry;
    approach = step === "pickup" ? leg?.geometry : null;
    fit =
      step === "pickup"
        ? [me, pickupPoint].filter(Boolean).map((p) => [p.lat, p.lng])
        : trip?.geometry || [];
  }
  const fitKey = [step, request?._id, ride?._id, trip?.geometry?.length, me ? "m" : ""].join("|");

  const map = (
    <MapView
      me={me}
      pickup={pickupPoint}
      destination={destPoint}
      route={route}
      approach={approach}
      fit={fit}
      fitKey={fitKey}
    />
  );

  return (
    <RideLayout
      map={map}
      title="Speed Captain"
      subtitle={captain?.fullname?.firstname ? `Hi, ${captain.fullname.firstname}` : "Driver"}
      onLogout={handleLogout}
    >
      <Toaster position="top-center" />

      {step === "idle" && !request && (
        <CaptainDetails
          captain={captain}
          locationError={locError}
          hasLocation={!!me}
        />
      )}

      {request && (
        <RidePopUp
          ride={request}
          pickupKm={pickupKm}
          queued={requests.length - 1}
          accepting={busy}
          onAccept={() => accept(request)}
          onIgnore={() =>
            setRequests((list) => list.filter((r) => r._id !== request._id))
          }
        />
      )}

      {step === "pickup" && ride && (
        <ConfirmRidePopUp ride={ride} leg={leg} onStart={startRide} starting={busy} />
      )}

      {step === "riding" && ride && (
        <FinishRide ride={ride} leg={leg} onFinish={finishRide} finishing={busy} />
      )}

      {step === "completed" && ride && <RideComplete ride={ride} onDone={done} />}
    </RideLayout>
  );
};

export default CaptainHome;
