import { useState, useEffect, useCallback } from "react";
import { SavedTrip, TripOption } from "../types/transit";
import { SearchParams } from "../components/SearchForm";

const STORAGE_KEY = "transit_planner_saved_trips";

export function useSavedTrips() {
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedTrips(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved trips", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTrips));
      } catch (e) {
        console.error("Failed to save trips to local storage", e);
      }
    }
  }, [savedTrips, isLoaded]);

  const saveTrip = useCallback((trip: TripOption, params: SearchParams) => {
    setSavedTrips((prev) => {
      // Don't save exact duplicates
      if (prev.some((t) => t.tripOption.id === trip.id)) {
        return prev;
      }
      
      const newSavedTrip: SavedTrip = {
        id: crypto.randomUUID(),
        origin: params.origin?.name || "Unknown Origin",
        destination: params.destination?.name || "Unknown Destination",
        departureDateTime: trip.departureTime,
        savedAt: new Date().toISOString(),
        tripOption: trip,
      };
      
      return [newSavedTrip, ...prev]; // Prepend new trips
    });
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const isTripSaved = useCallback((tripId: string) => {
    return savedTrips.some((t) => t.tripOption.id === tripId);
  }, [savedTrips]);

  return {
    savedTrips,
    saveTrip,
    deleteTrip,
    isTripSaved,
    isLoaded,
  };
}
