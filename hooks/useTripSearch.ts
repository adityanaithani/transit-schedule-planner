import { useState, useEffect } from "react";
import { planTrip } from "../lib/tripPlanner";
import { TripOption } from "../types/transit";
import { SearchParams } from "../components/SearchForm";

export function useTripSearch(params: SearchParams | null) {
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!params || !params.origin || !params.destination) {
        setTrips([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const results = await planTrip(
          params.origin!.lat,
          params.origin!.lon,
          params.destination!.lat,
          params.destination!.lon,
          params.date,
          params.time
        );
        
        setTrips(results);
        if (results.length === 0) {
          setError("No direct routes found between these locations.");
        }
      } catch (err) {
        console.error("Trip search error:", err);
        setError("Failed to fetch trip options. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [params]);

  return { trips, isLoading, error };
}
