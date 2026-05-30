import { SavedTrip } from "../types/transit";
import RouteBadge from "./RouteBadge";

interface SavedTripsSidebarProps {
  savedTrips: SavedTrip[];
  onDelete: (id: string) => void;
}

export default function SavedTripsSidebar({ savedTrips, onDelete }: SavedTripsSidebarProps) {
  if (savedTrips.length === 0) return null;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
        Saved Trips
      </h2>
      <ul className="space-y-3">
        {savedTrips.map((trip) => {
          const transitLeg = trip.tripOption.legs.find((l) => l.type === "transit");
          
          return (
            <li 
              key={trip.id}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-all hover:border-yellow-400/50 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <span>{formatDate(trip.departureDateTime)}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span>{formatTime(trip.departureDateTime)}</span>
                  </div>
                  <div className="line-clamp-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {trip.origin.split(",")[0]}
                  </div>
                  <div className="line-clamp-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    <span className="mr-1 text-zinc-400">to</span>
                    {trip.destination.split(",")[0]}
                  </div>
                </div>
                
                {transitLeg && (
                  <div className="shrink-0 pt-1">
                    <RouteBadge name={transitLeg.route?.name || ""} color={transitLeg.route?.color} />
                  </div>
                )}
              </div>
              
              <button
                onClick={() => onDelete(trip.id)}
                className="absolute bottom-2 right-2 rounded-full p-1.5 text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20"
                title="Remove saved trip"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
