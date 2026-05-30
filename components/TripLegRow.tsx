import { TripLeg } from "../types/transit";
import RouteBadge from "./RouteBadge";

interface TripLegRowProps {
  leg: TripLeg;
  isLast: boolean;
}

export default function TripLegRow({ leg, isLast }: TripLegRowProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full border-2 ${
          leg.type === "walk" ? "border-zinc-300 bg-white" : "border-yellow-400 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]"
        }`} />
        {!isLast && <div className="w-0.5 flex-1 bg-zinc-200 dark:bg-zinc-800" />}
      </div>

      {/* Content */}
      <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {formatTime(leg.departure)}
          </span>
          <span className="text-xs text-zinc-500">{leg.from.name}</span>
        </div>

        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {leg.type === "transit" ? (
                <>
                  <RouteBadge name={leg.route?.name || "???"} color={leg.route?.color} />
                  <span className="text-sm font-medium text-zinc-700 line-clamp-2 dark:text-zinc-300">
                    Take {leg.route?.name}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <svg className="h-3 w-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-zinc-700 line-clamp-2 dark:text-zinc-300">
                    Walk to {leg.to.name}
                  </span>
                </>
              )}
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs text-zinc-400">{leg.durationMinutes} min</span>
          </div>
        </div>
        
        {isLast && (
           <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatTime(leg.arrival)}
            </span>
            <span className="text-xs text-zinc-500">{leg.to.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
