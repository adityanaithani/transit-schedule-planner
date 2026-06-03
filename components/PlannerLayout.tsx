"use client";

import { useState, useEffect } from "react";
import SearchForm, { SearchParams } from "./SearchForm";
import TripResults from "./TripResults";
import SavedTripsSidebar from "./SavedTripsSidebar";
import { useTripSearch } from "../hooks/useTripSearch";
import { useSavedTrips } from "../hooks/useSavedTrips";

interface PlannerLayoutProps {
  initialParams?: SearchParams | null;
}

export default function PlannerLayout({ initialParams }: PlannerLayoutProps) {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(
    initialParams || null,
  );
  const { trips, isLoading, error } = useTripSearch(searchParams);
  const { savedTrips, saveTrip, deleteTrip, isTripSaved, isLoaded } =
    useSavedTrips();

  // If initialParams change (e.g. navigation), update the state
  useEffect(() => {
    if (initialParams) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchParams(initialParams);
    }
  }, [initialParams]);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Sidebar: Form & Saved Trips */}
      <aside className="w-full border-b border-zinc-200 bg-white p-6 lg:h-screen lg:w-96 lg:overflow-y-auto lg:border-b-0 lg:border-r dark:border-zinc-800 dark:bg-black">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Head<span className="text-yellow-400">way</span>
          </h1>
        </div>

        <SearchForm onSearch={handleSearch} initialParams={initialParams} />

        <SavedTripsSidebar
          savedTrips={savedTrips}
          onDelete={deleteTrip}
          isLoaded={isLoaded}
        />

        <div className="mt-12 text-xs text-zinc-400">
          <p>© 2026 Headway</p>
          <p className="mt-1">Data from Transitland & OpenStreetMap</p>
        </div>
      </aside>

      {/* Main: Results */}
      <main className="flex-1 bg-zinc-50 p-6 dark:bg-zinc-950 lg:h-screen lg:overflow-y-auto">
        {!searchParams ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-500">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Plan your next trip
            </h2>
            <p className="mt-2 text-zinc-500 max-w-xs">
              Enter an origin and destination to see upcoming scheduled TTC
              routes.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Trip Options
              </h2>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="font-semibold text-zinc-900 dark:text-zinc-300">
                  {searchParams.origin?.name.split(",")[0]}
                </span>
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7-7 7"
                  />
                </svg>
                <span className="font-semibold text-zinc-900 dark:text-zinc-300">
                  {searchParams.destination?.name.split(",")[0]}
                </span>
              </div>
            </div>

            <TripResults
              trips={trips}
              isLoading={isLoading}
              error={error}
              params={searchParams}
              onSaveTrip={saveTrip}
              isTripSaved={isTripSaved}
            />
          </div>
        )}
      </main>
    </div>
  );
}
