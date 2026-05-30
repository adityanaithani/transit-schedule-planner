import { useState, useEffect } from "react";
import { geocode } from "../lib/geocode";

export interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "address";
}

export function useStopSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const address = await geocode(query);

        if (address) {
          setResults([{
            id: `address-${address.lat}-${address.lon}`,
            name: address.name,
            lat: address.lat,
            lon: address.lon,
            type: "address",
          }]);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handler = setTimeout(fetchResults, 600);

    return () => clearTimeout(handler);
  }, [query]);

  return { results, isLoading };
}
