"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "@/lib/router";
import axios from "../utils/axios";
import { UserDataContext } from "../context/UserContext.jsx";
import usePolling from "../hooks/usePolling";
import useGeolocation from "../hooks/useGeolocation";
import {
  apiError,
  getFareQuote,
  getRoute,
  haversineKm,
  reverseGeocode,
} from "../lib/maps";
import RideLayout from "../components/RideLayout";
import MapView from "../components/map/MapView";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import { RideInProgress, RideComplete } from "../components/RideInProgress";

const pt = (c) => (c ? { lat: c.lat, lng: c.lng } : null);

// Rider screen: search -> vehicles (route + prices) -> searching -> assigned -> riding -> completed
const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserDataContext);
  const { position: me, request: requestLocation } = useGeolocation();

  const [step, setStep] = useState("search");
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [quote, setQuote] = useState(null); // {fare, distance, duration, geometry}
  const [quoteError, setQuoteError] = useState("");
  const [quoting, setQuoting] = useState(false);
  const [autoQuote, setAutoQuote] = useState(true); // false while the rider is editing a priced trip
  const [vehicleType, setVehicleType] = useState("car");
  const [ride, setRide] = useState(null);
  const [notified, setNotified] = useState(null);
  const [driver, setDriver] = useState(null);
  const [leg, setLeg] = useState(null); // driver -> pickup / destination
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);

  const autoFilled = useRef(false);
  const lastLegFrom = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    navigate("/userlogin");
  };

  /* ---------- current location as pickup ---------- */
  const fillCurrentLocation = async (silent = false) => {
    setLocating(true);
    try {
      let pos = me;
      if (!pos) {
        if (silent) return;
        pos = await requestLocation(); // asks for permission if needed
      }
      const addr = await reverseGeocode(pos.lat, pos.lng);
      setPickup({
        title: addr.title,
        description: addr.description,
        lat: pos.lat,
        lng: pos.lng,
      });
    } catch (err) {
      if (!silent) {
        toast.error(
          /location|gps|permission|blocked|took too long/i.test(err?.message || "")
            ? err.message
            : "Couldn't find the address of your location"
        );
      }
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (me && !autoFilled.current && step === "search" && !pickup && !ride) {
      autoFilled.current = true;
      fillCurrentLocation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, step]);

  /* ---------- trip picked on the landing page before login ---------- */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bookingDraft");
      if (!raw) return;
      sessionStorage.removeItem("bookingDraft");
      const draft = JSON.parse(raw);
      if (draft.pickup && draft.destination) {
        autoFilled.current = true;
        setPickup(draft.pickup);
        setDestination(draft.destination);
        if (draft.vehicleType) setVehicleType(draft.vehicleType);
      }
    } catch {}
  }, []);

  /* ---------- restore an ongoing ride after a refresh ---------- */
  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get("/ride/active");
        const r = data.ride;
        if (!r || cancelled) return;
        autoFilled.current = true;
        const p = { ...pt(r.pickupCoords), title: r.pickup, description: r.pickup };
        const d = { ...pt(r.destinationCoords), title: r.destination, description: r.destination };
        setPickup(p);
        setDestination(d);
        setRide(r);
        setVehicleType(r.vehicleType || "car");
        if (r.captain?.location?.ltd != null) {
          setDriver({ lat: r.captain.location.ltd, lng: r.captain.location.lng });
        }
        setStep(
          r.status === "pending"
            ? "searching"
            : r.status === "accepted"
            ? "assigned"
            : "riding"
        );
        const route = await getRoute(p, d);
        if (!cancelled) setQuote({ fare: {}, ...route });
      } catch (e) {
        console.error("Could not restore ride:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  /* ---------- price + route once both places are known ---------- */
  useEffect(() => {
    if (step !== "search" || !autoQuote || !pickup || !destination) return;
    let cancelled = false;
    setQuoting(true);
    setQuoteError("");
    getFareQuote(pickup, destination)
      .then((q) => {
        if (cancelled) return;
        setQuote(q);
        setStep("vehicles");
      })
      .catch((err) => {
        if (!cancelled) setQuoteError(apiError(err, "Couldn't find a route"));
      })
      .finally(() => !cancelled && setQuoting(false));
    return () => {
      cancelled = true;
    };
  }, [pickup, destination, step, autoQuote]);

  const editSearch = () => {
    setAutoQuote(false);
    setStep("search");
    setQuote(null);
  };
  const changePickup = (p) => {
    setPickup(p);
    if (p) setAutoQuote(true);
  };
  const changeDestination = (d) => {
    setDestination(d);
    if (d) setAutoQuote(true);
  };

  /* ---------- live ride status: polling (works on serverless hosts, no websockets) ---------- */
  const stepRef = useRef(step);
  stepRef.current = step;

  usePolling(
    async () => {
      const { data: r } = await axios.get(`/ride/${ride._id}`);
      const current = stepRef.current;

      if (r.captain?.location?.ltd != null) {
        setDriver({ lat: r.captain.location.ltd, lng: r.captain.location.lng });
      }

      if (r.status === "completed") {
        setRide((old) => ({ ...old, ...r }));
        setStep("completed");
        setLeg(null);
      } else if (r.status === "ongoing" && current !== "riding") {
        setRide((old) => ({ ...old, ...r }));
        setStep("riding");
        lastLegFrom.current = null;
        setLeg(null);
        toast.success("Ride started");
      } else if (r.status === "accepted" && current === "searching") {
        setRide((old) => ({ ...old, ...r }));
        setStep("assigned");
        lastLegFrom.current = null;
        toast.success("Captain found!");
      } else if (r.status === "cancelled") {
        setRide(null);
        setDriver(null);
        setLeg(null);
        setStep("search");
      }
    },
    2500,
    !!ride?._id && ["searching", "assigned", "riding"].includes(step)
  );

  /* ---------- live leg: driver -> pickup (assigned) / destination (riding) ---------- */
  useEffect(() => {
    if (!driver || !ride || !["assigned", "riding"].includes(step)) return;
    const moved = lastLegFrom.current
      ? haversineKm(lastLegFrom.current, driver) * 1000
      : Infinity;
    if (moved < 150) return;
    lastLegFrom.current = driver;
    const target = step === "assigned" ? pt(ride.pickupCoords) : pt(ride.destinationCoords);
    if (!target) return;
    getRoute(driver, target)
      .then(setLeg)
      .catch(() => {});
  }, [driver, step, ride]);

  /* ---------- actions ---------- */
  const book = async () => {
    setBusy(true);
    try {
      const { data } = await axios.post("/ride/create", {
        pickup: pickup.description,
        destination: destination.description,
        pickupCoords: pt(pickup),
        destinationCoords: pt(destination),
        vehicleType,
      });
      setRide(data);
      setNotified(data.notified);
      setDriver(null);
      setLeg(null);
      setStep("searching");
    } catch (err) {
      toast.error(apiError(err, "Couldn't book the ride"));
    } finally {
      setBusy(false);
    }
  };

  const cancelRide = async () => {
    setBusy(true);
    try {
      await axios.post("/ride/cancel", { rideId: ride._id });
      setRide(null);
      setDriver(null);
      setLeg(null);
      setStep(quote?.fare?.car != null ? "vehicles" : "search");
      toast("Ride cancelled");
    } catch (err) {
      toast.error(apiError(err, "Couldn't cancel the ride"));
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    setRide(null);
    setDriver(null);
    setLeg(null);
    setQuote(null);
    setDestination(null);
    setStep("search");
  };

  /* ---------- map props ---------- */
  const showRoute = ["vehicles", "assigned", "riding", "searching", "completed"].includes(step);
  const routeLine = showRoute ? quote?.geometry : null;
  const approach = step === "assigned" ? leg?.geometry : null;

  let fit = [];
  if (step === "assigned" && driver && ride?.pickupCoords) {
    fit = [[driver.lat, driver.lng], [ride.pickupCoords.lat, ride.pickupCoords.lng]];
  } else if (quote?.geometry?.length && showRoute) {
    fit = quote.geometry;
  } else {
    if (pickup) fit.push([pickup.lat, pickup.lng]);
    if (destination) fit.push([destination.lat, destination.lng]);
  }
  const fitKey = [
    step,
    pickup?.lat,
    destination?.lat,
    ride?._id,
    driver ? "d" : "",
    quote?.geometry?.length,
  ].join("|");

  const map = (
    <MapView
      me={me}
      pickup={pickup}
      destination={step === "search" && !destination ? null : destination}
      route={routeLine}
      approach={approach}
      driver={["assigned", "riding"].includes(step) ? driver : null}
      fit={fit}
      fitKey={fitKey}
    />
  );

  return (
    <RideLayout
      map={map}
      title="Speed"
      subtitle={user?.fullname?.firstname ? `Hi, ${user.fullname.firstname}` : "Book a ride"}
      onLogout={handleLogout}
      onProfile={() => navigate("/profile")}
    >
      <Toaster position="top-center" />

      {step === "search" && (
        <div>
          <h3 className="mb-3 text-xl font-semibold text-gray-900">Where to?</h3>
          <LocationSearchPanel
            pickup={pickup}
            destination={destination}
            onPickup={changePickup}
            onDestination={changeDestination}
            onUseCurrent={() => fillCurrentLocation(false)}
            near={me || pickup}
            locating={locating}
          />
          {quoting && (
            <p className="mt-3 animate-pulse rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              Finding the best route and prices…
            </p>
          )}
          {quoteError && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {quoteError}
            </p>
          )}
        </div>
      )}

      {step === "vehicles" && quote && (
        <VehiclePanel
          quote={quote}
          vehicleType={vehicleType}
          onSelect={setVehicleType}
          onBook={book}
          booking={busy}
          onEdit={editSearch}
          pickup={pickup}
          destination={destination}
        />
      )}

      {step === "searching" && ride && (
        <LookingForDriver
          ride={ride}
          notified={notified}
          onCancel={cancelRide}
          cancelling={busy}
        />
      )}

      {step === "assigned" && ride && (
        <WaitingForDriver
          ride={ride}
          leg={leg}
          onCancel={cancelRide}
          cancelling={busy}
        />
      )}

      {step === "riding" && ride && <RideInProgress ride={ride} leg={leg} />}

      {step === "completed" && ride && (
        <RideComplete
          ride={ride}
          onDone={finish}
          onRideUpdate={(r) => setRide((old) => ({ ...old, ...r }))}
          rider={{
            name: [user?.fullname?.firstname, user?.fullname?.lastname].filter(Boolean).join(" "),
            email: user?.email,
          }}
        />
      )}
    </RideLayout>
  );
};

export default Home;
