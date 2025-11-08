import React, { useEffect, useState, useRef } from "react";
import { IoLocationSharp } from "react-icons/io5";
import axios from "../utils/axios";

// props:
// - activeField: 'pickup' | 'destination'
// - query: current input text
// - setPickup / setDestination: setters from parent
// - setPanelOpen / setVehiclePanel: controls from parent
const LocationSearchPanel = ({
  activeField,
  query = "",
  suggestions: propSuggestions = null,
  setVehiclePanel,
  setPanelOpen,
  setPickup,
  setDestination,
}) => {
  const [suggestions, setSuggestions] = useState(propSuggestions || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(null);

  // debounce effect: fetch suggestions when query changes and length >=3
  useEffect(() => {
    // if parent passes suggestions, use them and skip fetching
    if (Array.isArray(propSuggestions)) {
      setSuggestions(propSuggestions);
      setLoading(false);
      return;
    }
    if (!query || query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        // cancel previous request if any
        if (cancelRef.current) {
          cancelRef.current.cancel("new request");
        }
        cancelRef.current = axios.CancelToken.source();

        // backend expects GET /maps/get-suggestions?input=...
        const resp = await axios.get("/maps/get-suggestions", {
          params: { input: query },
          cancelToken: cancelRef.current.token,
        });
        ``;
        // ensure we have an array of suggestions
        const data = resp && resp.data ? resp.data : [];

        // backend may return predictions or an array of strings — normalize
        let list = [];
        if (Array.isArray(data)) {
          // if objects with description field (Google), map to strings
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

        setSuggestions(list);
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error(err);
        setError("Failed to load suggestions");
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const handleSuggestionClick = (suggestion) => {
    if (activeField === "pickup") {
      setPickup(suggestion);
    } else if (activeField === "destination") {
      setDestination(suggestion);
    }
    // after selecting, close search panel and open vehicle panel
    // if (setPanelOpen) setPanelOpen(false);
    // if (setVehiclePanel) setVehiclePanel(true);
  };

  return (
    <div>
      {loading && <div className="p-3">Loading...</div>}
      {error && <div className="p-3 text-red-500">{error}</div>}

      {Array.isArray(suggestions) && suggestions.length === 0 && !loading && (
        <div className="p-3 text-gray-500">No suggestions</div>
      )}

      {Array.isArray(suggestions) &&
        suggestions.map((elem, idx) => (
          <div
            key={idx}
            onClick={() => {
              handleSuggestionClick(elem);
            }}
            className="flex gap-4 items-center my-2 border-2 p-3 rounded-xl border-gray-200 active:border-black justify-start"
          >
            <h2 className="bg-[#eee] rounded-full h-10 flex items-center justify-center w-10">
              <IoLocationSharp className="text-xl" />
            </h2>
            <h4>{elem}</h4>
          </div>
        ))}
    </div>
  );
};

export default LocationSearchPanel;
