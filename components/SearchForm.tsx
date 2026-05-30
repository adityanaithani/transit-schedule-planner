"use client";

import { useState } from "react";
import StopSearch from "./StopSearch";
import DateTimePicker from "./DateTimePicker";
import { SearchResult } from "../hooks/useStopSearch";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
}

export interface SearchParams {
  origin: SearchResult | null;
  destination: SearchResult | null;
  date: string;
  time: string;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [origin, setOrigin] = useState<SearchResult | null>(null);
  const [destination, setDestination] = useState<SearchResult | null>(null);
  
  // Default to now
  const now = new Date();
  const defaultDate = now.toISOString().split("T")[0];
  const defaultTime = now.toTimeString().split(" ")[0].slice(0, 5);
  
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination) {
      onSearch({ origin, destination, date, time });
    }
  };

  const swapPlaces = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="relative space-y-4">
        <StopSearch
          label="Where from?"
          placeholder="Enter origin stop or address..."
          onSelect={setOrigin}
          defaultValue={origin?.name}
        />
        
        <div className="flex justify-center -my-2">
          <button
            type="button"
            onClick={swapPlaces}
            className="z-10 rounded-full border border-zinc-200 bg-white p-2 text-zinc-400 shadow-sm transition-all hover:border-yellow-400 hover:text-yellow-600 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:text-yellow-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        <StopSearch
          label="Where to?"
          placeholder="Enter destination stop or address..."
          onSelect={setDestination}
          defaultValue={destination?.name}
        />
      </div>

      <DateTimePicker
        date={date}
        time={time}
        onDateChange={setDate}
        onTimeChange={setTime}
      />

      <button
        type="submit"
        disabled={!origin || !destination}
        className="w-full rounded-xl bg-yellow-400 py-4 text-center text-lg font-bold text-zinc-900 shadow-[0_4px_14px_0_rgba(250,204,21,0.39)] transition-all hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none dark:disabled:bg-zinc-800"
      >
        Find Trips
      </button>
    </form>
  );
}
