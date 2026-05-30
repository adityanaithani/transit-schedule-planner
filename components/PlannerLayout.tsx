"use client";

import { useState } from "react";
import SearchForm, { SearchParams } from "./SearchForm";

export default function PlannerLayout() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    console.log("Searching for:", params);
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Sidebar: Form */}
      <aside className="w-full border-b border-zinc-200 bg-white p-6 lg:h-screen lg:w-96 lg:overflow-y-auto lg:border-b-0 lg:border-r dark:border-zinc-800 dark:bg-black">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            TRANSIT <span className="text-yellow-400">PLANNER</span>
          </h1>
          <p className="text-sm text-zinc-500">Toronto scheduled trip planning</p>
        </div>
        
        <SearchForm onSearch={handleSearch} />

        <div className="mt-12 text-xs text-zinc-400">
          <p>© 2026 Transit Schedule Planner PoC</p>
          <p className="mt-1">Data from Transitland & OpenStreetMap</p>
        </div>
      </aside>

      {/* Main: Results */}
      <main className="flex-1 bg-zinc-50 p-6 dark:bg-zinc-950 lg:h-screen lg:overflow-y-auto">
        {!searchParams ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Plan your next trip</h2>
            <p className="mt-2 text-zinc-500 max-w-xs">
              Enter an origin and destination to see upcoming scheduled TTC routes.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Trip Options</h2>
              <span className="text-sm text-zinc-500">
                {searchParams.origin?.name.split(",")[0]} → {searchParams.destination?.name.split(",")[0]}
              </span>
            </div>
            
            <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-400 italic">Trip results loading implementation coming next...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
