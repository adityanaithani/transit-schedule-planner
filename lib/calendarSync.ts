import { CalendarEvent } from "./calendar";
import { geocode } from "./geocode";
import { planTrip } from "./tripPlanner";
import { TripOption } from "../types/transit";

export interface PlannedCalendarTrip {
  event: CalendarEvent;
  originName: string;
  tripOption: TripOption | null;
  error?: string;
}

export async function planCalendarTrips(
  events: CalendarEvent[],
  homeBase: string
): Promise<PlannedCalendarTrip[]> {
  const plannedTrips: PlannedCalendarTrip[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const prevEvent = i > 0 ? events[i - 1] : null;

    let originName = homeBase;

    // Check if the previous event was on the same day
    if (prevEvent) {
      const isSameDay =
        event.startDate.toDateString() === prevEvent.startDate.toDateString();
      if (isSameDay) {
        originName = prevEvent.location;
      }
    }

    try {
      const origin = await geocode(originName);
      const destination = await geocode(event.location);

      if (!origin || !destination) {
        plannedTrips.push({
          event,
          originName,
          tripOption: null,
          error: "Failed to geocode locations",
        });
        continue;
      }

      // Search starting 2 hours before the event
      const searchDate = new Date(event.startDate.getTime() - 2 * 60 * 60 * 1000);
      const dateStr = searchDate.toISOString().split("T")[0];
      const timeStr = searchDate.toLocaleTimeString("en-GB", { hour12: false }).slice(0, 5); // "HH:MM"

      const rawTrips = await planTrip(
        origin.lat,
        origin.lon,
        destination.lat,
        destination.lon,
        dateStr,
        timeStr
      );

      // Filter trips to only those arriving BEFORE the event starts
      const validTrips = rawTrips.filter((t) => {
        const arrivalDate = new Date(t.arrivalTime);
        return arrivalDate <= event.startDate;
      });

      if (validTrips.length > 0) {
        // Pick the trip that lets us depart the latest (minimize waiting)
        validTrips.sort(
          (a, b) =>
            new Date(b.departureTime).getTime() -
            new Date(a.departureTime).getTime()
        );
        plannedTrips.push({ event, originName, tripOption: validTrips[0] });
      } else {
        plannedTrips.push({
          event,
          originName,
          tripOption: null,
          error: "No direct routes arriving on time",
        });
      }
    } catch (err) {
      console.error("Error planning calendar trip:", err);
      plannedTrips.push({
        event,
        originName,
        tripOption: null,
        error: "Internal error during planning",
      });
    }
  }

  return plannedTrips;
}
