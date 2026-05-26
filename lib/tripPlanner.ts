import { getStops, getStopTimes } from "./transitland";
import { TripOption, TripLeg, StopTime, Stop } from "../types/transit";

// A simple utility to generate unique IDs for React keys and URL encoding
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Convert "HH:MM:SS" to minutes since midnight for duration math
function timeToMinutes(timeStr: string): number {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 60 + minutes + Math.round((seconds || 0) / 60);
}

// Ensure two digits for hours/minutes
function formatTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
}

export async function planTrip(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
  date: string, // YYYY-MM-DD
  time: string  // HH:MM (will append :00)
): Promise<TripOption[]> {
  const startTime = time.length === 5 ? `${time}:00` : time;

  // 1. Find nearby stops
  const [originStops, destStops] = await Promise.all([
    getStops(originLat, originLon, 500),
    getStops(destLat, destLon, 500),
  ]);

  if (originStops.length === 0 || destStops.length === 0) {
    return []; // No stops near origin or destination
  }

  // 2. Fetch upcoming stop times for all origin stops
  const originDeparturesPromises = originStops.map(async (stop) => {
    try {
      const times = await getStopTimes(stop.id, date, startTime);
      return times.map((t) => ({ ...t, stop }));
    } catch (e) {
      console.warn(`Failed to fetch times for origin stop ${stop.id}`, e);
      return [];
    }
  });

  // 3. Fetch upcoming stop times for all destination stops
  const destArrivalsPromises = destStops.map(async (stop) => {
    try {
      const times = await getStopTimes(stop.id, date, startTime);
      return times.map((t) => ({ ...t, stop }));
    } catch (e) {
      console.warn(`Failed to fetch times for dest stop ${stop.id}`, e);
      return [];
    }
  });

  const allOriginDepartures = (await Promise.all(originDeparturesPromises)).flat();
  const allDestArrivals = (await Promise.all(destArrivalsPromises)).flat();

  // 4. Find matching trips
  const tripOptions: TripOption[] = [];

  // Group dest arrivals by trip ID for fast lookup
  const destArrivalsByTripId = new Map<string, (StopTime & { stop: Stop })>();
  for (const arrival of allDestArrivals) {
    destArrivalsByTripId.set(arrival.trip.id, arrival);
  }

  // Iterate over origin departures and look for a matching destination arrival
  for (const originDep of allOriginDepartures) {
    const matchingDestArr = destArrivalsByTripId.get(originDep.trip.id);

    if (matchingDestArr) {
      // Validate direction: arrival must be after departure
      const depMins = timeToMinutes(originDep.departure_time);
      const arrMins = timeToMinutes(matchingDestArr.arrival_time);

      if (arrMins > depMins) {
        // Calculate durations
        const transitDuration = arrMins - depMins;
        const walkToOriginMins = 5; // Hardcoded per requirements
        const walkFromDestMins = 5; // Hardcoded per requirements
        const totalDuration = walkToOriginMins + transitDuration + walkFromDestMins;

        // Construct ISO datetimes for departure/arrival (naive local time for PoC)
        const tripDepartureTime = `${date}T${formatTime(depMins - walkToOriginMins)}`;
        const tripArrivalTime = `${date}T${formatTime(arrMins + walkFromDestMins)}`;

        // Origin walk leg
        const originWalkLeg: TripLeg = {
          type: "walk",
          from: { id: "origin", name: "Origin", lat: originLat, lon: originLon },
          to: originDep.stop,
          departure: tripDepartureTime,
          arrival: `${date}T${originDep.departure_time}`,
          durationMinutes: walkToOriginMins,
        };

        // Transit leg
        const transitLeg: TripLeg = {
          type: "transit",
          from: originDep.stop,
          to: matchingDestArr.stop,
          departure: `${date}T${originDep.departure_time}`,
          arrival: `${date}T${matchingDestArr.arrival_time}`,
          route: originDep.trip.route,
          durationMinutes: transitDuration,
        };

        // Dest walk leg
        const destWalkLeg: TripLeg = {
          type: "walk",
          from: matchingDestArr.stop,
          to: { id: "destination", name: "Destination", lat: destLat, lon: destLon },
          departure: `${date}T${matchingDestArr.arrival_time}`,
          arrival: tripArrivalTime,
          durationMinutes: walkFromDestMins,
        };

        tripOptions.push({
          id: generateId(),
          legs: [originWalkLeg, transitLeg, destWalkLeg],
          totalDurationMinutes: totalDuration,
          departureTime: tripDepartureTime,
          arrivalTime: tripArrivalTime,
        });
      }
    }
  }

  // 5. Sort options by earliest departure time
  tripOptions.sort((a, b) => {
    return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
  });

  // Limit to top 5 options for the UI
  return tripOptions.slice(0, 5);
}
