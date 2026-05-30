import { TripOption } from "../types/transit";
import TripOptionCard from "./TripOptionCard";
import { SearchParams } from "./SearchForm";

interface TripResultsProps {
  trips: TripOption[];
  isLoading: boolean;
  error: string | null;
  params: SearchParams | null;
  onSaveTrip: (trip: TripOption, params: SearchParams) => void;
  isTripSaved: (tripId: string) => boolean;
}

export default function TripResults({ 
  trips, 
  isLoading, 
  error, 
  params,
  onSaveTrip,
  isTripSaved
}: TripResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-900/10">
        <svg className="mb-4 h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Oops!</h3>
        <p className="mt-1 text-sm text-red-700 dark:text-red-500">{error}</p>
      </div>
    );
  }

  if (trips.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 pb-20">
      {trips.map((trip) => (
        <TripOptionCard 
          key={trip.id} 
          trip={trip} 
          isSaved={isTripSaved(trip.id)}
          onSave={() => {
            if (params) onSaveTrip(trip, params);
          }}
        />
      ))}
    </div>
  );
}
