import { Stop, Route, StopTime } from "../types/transit";

const BASE_URL = "https://transit.land/api/v2/rest";
const TTC_OPERATOR_ID = "o-dpz8-ttc";

async function fetchFromTransitland<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const apiKey = process.env.NEXT_PUBLIC_TRANSITLAND_API_KEY;
  if (!apiKey) {
    throw new Error("API key not set in env.");
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      apikey: apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Find stops near a coordinate within a given radius
 */
export async function getStops(
  lat: number,
  lon: number,
  radiusMeters: number = 500,
): Promise<Stop[]> {
  const data = await fetchFromTransitland<{ stops: any[] }>("/stops", {
    lat: lat.toString(),
    lon: lon.toString(),
    radius: radiusMeters.toString(),
    served_by_onestop_id: TTC_OPERATOR_ID,
    limit: "100",
  });

  return data.stops.map((s) => ({
    id: s.onestop_id,
    name: s.stop_name,
    lat: s.geometry.coordinates[1],
    lon: s.geometry.coordinates[0],
  }));
}

/**
 * Find all TTC routes
 */
export async function getRoutes(): Promise<Route[]> {
  const data = await fetchFromTransitland<{ routes: Route[] }>("/routes", {
    operator_onestop_id: TTC_OPERATOR_ID,
  });
  return data.routes;
}

/**
 * Fetch departures from a specific stop after a given time.
 * @param stopId Transitland stop ID
 * @param date YYYY-MM-DD
 * @param startTime HH:MM:SS
 */
export async function getStopTimes(
  stopId: string,
  date: string,
  startTime: string,
): Promise<StopTime[]> {
  // Transitland v2 REST API uses /stops/{id}/departures instead of /stop_times
  const data = await fetchFromTransitland<{
    stops: Array<{
      departures: Array<{
        arrival: { scheduled: string };
        departure: { scheduled: string };
        trip: {
          id: any;
          trip_id: string; // The canonical GTFS trip_id
          route: {
            route_id: string;
            route_short_name: string;
            route_long_name: string;
            route_color: string;
          };
        };
      }>;
    }>;
  }>(`/stops/${stopId}/departures`, {
    date: date,
    start_time: startTime,
    next: "3",
  });

  if (!data.stops || data.stops.length === 0 || !data.stops[0].departures) {
    return [];
  }

  // map transitland response to stoptime
  return data.stops[0].departures.map((dep) => ({
    departure_time: dep.departure.scheduled,
    arrival_time: dep.arrival.scheduled,
    stop: {} as any,
    trip: {
      id: dep.trip.trip_id || dep.trip.id.toString(), // Prefer GTFS trip_id for cross-stop matching
      route: {
        id: dep.trip.route.route_id,
        name: dep.trip.route.route_short_name || dep.trip.route.route_long_name,
        color: dep.trip.route.route_color
          ? `#${dep.trip.route.route_color}`
          : "#E32636",
        operator: { name: "TTC" },
      },
    },
  }));
}
