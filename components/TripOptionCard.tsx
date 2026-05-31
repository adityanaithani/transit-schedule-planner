import { TripOption } from "../types/transit";
import TripLegRow from "./TripLegRow";
import RouteBadge from "./RouteBadge";
import ShareButton from "./ShareButton";
import { SearchParams } from "./SearchForm";

interface TripOptionCardProps {
  trip: TripOption;
  isSaved?: boolean;
  onSave?: () => void;
  searchParams?: SearchParams | null;
}

export default function TripOptionCard({ trip, isSaved, onSave, searchParams }: TripOptionCardProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const transitLeg = trip.legs.find((l) => l.type === "transit");

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-yellow-400/50 hover:shadow-md dark:border-zinc-800 dark:bg-black dark:hover:border-yellow-400/30">
      {/* Header Summary */}
      <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-black text-zinc-900 dark:text-white">
              {formatTime(trip.departureTime)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Depart
            </div>
          </div>
          
          <div className="h-px w-6 bg-zinc-200 dark:bg-zinc-800" />
          
          <div className="text-center">
            <div className="text-lg font-black text-zinc-900 dark:text-white">
              {formatTime(trip.arrivalTime)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Arrive
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {trip.totalDurationMinutes}
            </span>
            <span className="text-sm text-zinc-500">min</span>
          </div>
          {transitLeg && (
            <RouteBadge
              name={transitLeg.route?.name || ""}
              color={transitLeg.route?.color}
            />
          )}
        </div>
      </div>

      {/* Detailed Legs */}
      <div className="bg-zinc-50/50 p-6 dark:bg-zinc-900/20">
        <div className="space-y-0">
          {trip.legs.map((leg, idx) => (
            <TripLegRow
              key={idx}
              leg={leg}
              isLast={idx === trip.legs.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <button 
          onClick={onSave}
          disabled={isSaved}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
            isSaved 
              ? "text-zinc-400 cursor-not-allowed dark:text-zinc-600" 
              : "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
          }`}
        >
          {isSaved ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
          {isSaved ? "Saved" : "Save Trip"}
        </button>
        <ShareButton params={searchParams || null} />
      </div>
    </div>
  );
}
