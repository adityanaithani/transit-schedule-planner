import { useState, useEffect } from "react";
import { searchStops } from "../lib/transitland";
import { geocode } from "../lib/geocode";

export interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "address" | "stop";
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
        const [stops, address] = await Promise.all([
          searchStops(query).catch(() => []),
          geocode(query).catch(() => null),
        ]);

        const combined: SearchResult[] = [];

        if (address) {
          combined.push({
            id: `address-${address.lat}-${address.lon}`,
            name: address.name,
            lat: address.lat,
            lon: address.lon,
            type: "address",
          });
        }

        // Add transit stops, but deduplicate identical coordinates/names
        const seenNames = new Set<string>();
        if (address) seenNames.add(address.name);

        stops.forEach((s) => {
          if (!seenNames.has(s.name)) {
            seenNames.add(s.name);
            combined.push({
              id: s.id,
              name: s.name,
              lat: s.lat,
              lon: s.lon,
              type: "stop",
            });
          }
        });

        setResults(combined.slice(0, 8));
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handler = setTimeout(fetchResults, 400);

    return () => clearTimeout(handler);
  }, [query]);

  return { results, isLoading };
}
