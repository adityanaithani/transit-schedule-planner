import { useState, useEffect } from "react";
import { searchStops } from "../lib/transitland";
import { geocode } from "../lib/geocode";
import { Stop } from "../types/transit";

export interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "stop" | "address";
}

export function useStopSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Run both searches in parallel
        const [stops, address] = await Promise.all([
          searchStops(query),
          geocode(query),
        ]);

        const combined: SearchResult[] = [];

        // Add stops first
        stops.forEach((s) => {
          combined.push({
            id: s.id,
            name: s.name,
            lat: s.lat,
            lon: s.lon,
            type: "stop",
          });
        });

        // Add geocode result if it's not already covered by a stop (simplified check)
        if (address) {
          combined.push({
            id: `address-${address.lat}-${address.lon}`,
            name: address.name,
            lat: address.lat,
            lon: address.lon,
            type: "address",
          });
        }

        // Deduplicate and limit
        const seen = new Set<string>();
        const finalResults = combined.filter((r) => {
          if (seen.has(r.name)) return false;
          seen.add(r.name);
          return true;
        }).slice(0, 8);

        setResults(finalResults);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  return { results, isLoading };
}
