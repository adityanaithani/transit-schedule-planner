import { getStops, getStopTimes } from "./transitland";
import { TripOption, TripLeg, StopTime, Stop } from "../types/transit";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 60 + minutes + Math.round((seconds || 0) / 60);
}

function constructIsoDateTime(baseDateStr: string, minutesSinceMidnight: number): string {
  const daysToAdd = Math.floor(minutesSinceMidnight / (24 * 60));
  const hours = Math.floor((minutesSinceMidnight % (24 * 60)) / 60);
  const minutes = minutesSinceMidnight % 60;
  
  const [year, month, day] = baseDateStr.split("-").map(Number);
  // JS Date automatically handles rolling over to the next month/year if day exceeds the month length
  const jsDate = new Date(year, month - 1, day + daysToAdd);
  
  const outYear = jsDate.getFullYear();
  const outMonth = (jsDate.getMonth() + 1).toString().padStart(2, "0");
  const outDay = jsDate.getDate().toString().padStart(2, "0");
  
  const outHour = hours.toString().padStart(2, "0");
  const outMin = minutes.toString().padStart(2, "0");
  
  return `${outYear}-${outMonth}-${outDay}T${outHour}:${outMin}:00`;
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
  // Using a 600m radius to ensure we catch bus/streetcar stops if Nominatim geocodes 
  // the intersection slightly off-center.
  const [originStops, destStops] = await Promise.all([
    getStops(originLat, originLon, 600),
    getStops(destLat, destLon, 600),
  ]);

  if (originStops.length === 0 || destStops.length === 0) {
    return [];
  }

  // To prevent extremely slow execution and API rate limits, 
  // slice the stops. We need at least 40 to ensure subway platforms in dense 
  // hubs like Union Station are not accidentally discarded.
  const limitedOriginStops = originStops.slice(0, 40);
  const limitedDestStops = destStops.slice(0, 40);

  // Helper to fetch in batches to balance rate limiting and concurrency
  async function fetchTimesInBatches(stops: Stop[], isOrigin: boolean, batchSize = 5) {
    const results: StopTime[][] = [];
    for (let i = 0; i < stops.length; i += batchSize) {
      const batch = stops.slice(i, i + batchSize);
      const batchPromises = batch.map(async (stop) => {
        try {
          const times = await getStopTimes(stop.id, date, startTime);
          return times.map((t) => ({ ...t, stop }));
        } catch (e) {
          console.warn(`Failed to fetch times for ${isOrigin ? 'origin' : 'dest'} stop ${stop.id}`, e);
          return [];
        }
      });
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    return results;
  }

  const originDeparturesPromises = await fetchTimesInBatches(limitedOriginStops, true);
  const destArrivalsPromises = await fetchTimesInBatches(limitedDestStops, false);

  const allOriginDepartures = originDeparturesPromises.flat();
  const allDestArrivals = destArrivalsPromises.flat();

  const tripOptions: TripOption[] = [];

  // Group dest arrivals by trip ID for fast lookup
  const destArrivalsByTripId = new Map<string, StopTime & { stop: Stop }>();
  for (const arrival of allDestArrivals) {
    destArrivalsByTripId.set(arrival.trip.id, arrival);
  }

  // Iterate over origin departures, look for a matching destination arrival
  for (const originDep of allOriginDepartures) {
    const matchingDestArr = destArrivalsByTripId.get(originDep.trip.id);

    if (matchingDestArr && originDep.departure_time && matchingDestArr.arrival_time) {
      // Validate direction - arrival must be after departure
      const depMins = timeToMinutes(originDep.departure_time);
      const arrMins = timeToMinutes(matchingDestArr.arrival_time);

      if (arrMins > depMins) {
        const transitDuration = arrMins - depMins;
        const walkToOriginMins = 5; // Hardcoded
        const walkFromDestMins = 5; // Hardcoded
        const totalDuration =
          walkToOriginMins + transitDuration + walkFromDestMins;

        // Construct ISO datetimes for departure/arrival
        const tripDepartureTime = constructIsoDateTime(date, depMins - walkToOriginMins);
        const tripArrivalTime = constructIsoDateTime(date, arrMins + walkFromDestMins);

        // Origin walk leg
        const originWalkLeg: TripLeg = {
          type: "walk",
          from: {
            id: "origin",
            name: "Origin",
            lat: originLat,
            lon: originLon,
          },
          to: originDep.stop,
          departure: tripDepartureTime,
          arrival: constructIsoDateTime(date, depMins),
          durationMinutes: walkToOriginMins,
        };

        // Transit leg
        const transitLeg: TripLeg = {
          type: "transit",
          from: originDep.stop,
          to: matchingDestArr.stop,
          departure: constructIsoDateTime(date, depMins),
          arrival: constructIsoDateTime(date, arrMins),
          route: originDep.trip.route,
          durationMinutes: transitDuration,
        };

        // Dest walk leg
        const destWalkLeg: TripLeg = {
          type: "walk",
          from: matchingDestArr.stop,
          to: {
            id: "destination",
            name: "Destination",
            lat: destLat,
            lon: destLon,
          },
          departure: constructIsoDateTime(date, arrMins),
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
    return (
      new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
    );
  });

  // Limit to top 5 options for the UI
  return tripOptions.slice(0, 5);
}
