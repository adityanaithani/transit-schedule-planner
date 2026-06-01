"use client";

import { useState, useRef, useEffect } from "react";
import { useStopSearch, SearchResult } from "../hooks/useStopSearch";

interface StopSearchProps {
  label: string;
  placeholder: string;
  onSelect: (result: SearchResult) => void;
  defaultValue?: string;
}

export default function StopSearch({
  label,
  placeholder,
  onSelect,
  defaultValue = "",
}: StopSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading } = useStopSearch(query);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal query state when the defaultValue prop changes from outside (e.g. swap button)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (result: SearchResult) => {
    setQuery(result.name);
    setIsOpen(false);
    onSelect(result);
  };

  return (
    <div className={`relative w-full ${isOpen ? "z-50" : "z-0"}`} ref={wrapperRef}>
      <label className="mb-1 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-base shadow-sm outline-none transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
      />

      {isOpen && (query.length >= 3) && (
        <div className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          {isLoading && (
            <div className="p-4 text-center text-sm text-zinc-500">Searching...</div>
          )}
          {!isLoading && results.length === 0 && (
            <div className="p-4 text-center text-sm text-zinc-500">No results found</div>
          )}
          {!isLoading && results.length > 0 && (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
                      {result.type === "stop" ? (
                        <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                      ) : (
                        <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {result.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {result.type === "stop" ? "TTC Stop" : "Address"}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
