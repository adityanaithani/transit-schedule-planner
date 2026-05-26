export interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface Route {
  id: string;
  name: string;
  color: string;
  operator: {
    name: string;
  };
}

export interface StopTime {
  departure_time: string;
  arrival_time: string;
  stop: Stop;
  trip: {
    id: string;
    route: Route;
  };
}

export interface TripLeg {
  type: "walk" | "transit";
  from: Stop;
  to: Stop;
  departure: string;
  arrival: string;
  route?: Route;
  durationMinutes: number;
}

export interface TripOption {
  id: string;
  legs: TripLeg[];
  totalDurationMinutes: number;
  departureTime: string;
  arrivalTime: string;
}

export interface SavedTrip {
  id: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  savedAt: string;
  tripOption: TripOption;
}
