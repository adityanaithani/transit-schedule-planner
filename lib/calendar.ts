import ICAL from "ical.js";

export interface CalendarEvent {
  id: string;
  summary: string;
  location: string;
  startDate: Date;
}

export function parseICS(icsData: string): CalendarEvent[] {
  try {
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(now.getDate() + 14);

    const events: CalendarEvent[] = [];

    vevents.forEach((vevent) => {
      const event = new ICAL.Event(vevent);
      
      if (!event.location) return; // Skip events without a location

      const startDate = event.startDate.toJSDate();
      
      // Filter for upcoming events in the next 14 days
      if (startDate >= now && startDate <= twoWeeksFromNow) {
        events.push({
          id: vevent.getFirstPropertyValue("uid") || crypto.randomUUID(),
          summary: event.summary,
          location: event.location,
          startDate: startDate,
        });
      }
    });

    // Sort chronologically
    return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  } catch (error) {
    console.error("Failed to parse ICS data:", error);
    return [];
  }
}
