"use client";

import { useState } from "react";
import { parseICS } from "../lib/calendar";
import { planCalendarTrips } from "../lib/calendarSync";
import { SearchParams } from "./SearchForm";
import { TripOption } from "../types/transit";

interface CalendarSyncModalProps {
  onClose: () => void;
  onSaveTrip: (trip: TripOption, params: SearchParams) => void;
}

export default function CalendarSyncModal({
  onClose,
  onSaveTrip,
}: CalendarSyncModalProps) {
  const [homeBase, setHomeBase] = useState("");
  const [icsUrl, setIcsUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const processAndSaveEvents = async (events: ReturnType<typeof parseICS>) => {
    if (events.length === 0) {
      setStatusMsg("No upcoming events found with locations.");
      return false;
    }
    setStatusMsg(`Found ${events.length} events. Planning trips...`);
    const plannedTrips = await planCalendarTrips(events, homeBase);

    let savedCount = 0;
    for (const pt of plannedTrips) {
      if (pt.tripOption) {
        onSaveTrip(pt.tripOption, {
          origin: {
            id: "origin",
            name: pt.originName,
            lat: 0,
            lon: 0,
            type: "address",
          },
          destination: {
            id: "dest",
            name: pt.event.location,
            lat: 0,
            lon: 0,
            type: "address",
          },
          date: pt.tripOption.departureTime?.split("T")[0] || "",
          time: pt.tripOption.departureTime?.split("T")[1]?.slice(0, 5) || "",
        });
        savedCount++;
      }
    }

    setStatusMsg(`Successfully synced and saved ${savedCount} trips!`);
    return true;
  };

  const handleSync = async () => {
    if (!homeBase) {
      setStatusMsg("Please provide a home base.");
      return;
    }

    setIsLoading(true);
    setStatusMsg("Fetching calendar...");

    try {
      let icsData = "";
      if (icsUrl) {
        const response = await fetch(icsUrl);
        if (!response.ok) throw new Error("Failed to fetch ICS URL");
        icsData = await response.text();
      } else {
        setStatusMsg("Please provide an ICS URL.");
        setIsLoading(false);
        return;
      }

      setStatusMsg("Parsing calendar events...");
      const events = parseICS(icsData);

      const success = await processAndSaveEvents(events);
      if (success) {
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setStatusMsg(
        "Failed to sync calendar. Please check the URL and try again.",
      );
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!homeBase) {
      setStatusMsg("Please provide a home base first.");
      return;
    }

    setIsLoading(true);
    setStatusMsg("Reading file...");
    const text = await file.text();

    setStatusMsg("Parsing calendar events...");
    const events = parseICS(text);

    const success = await processAndSaveEvents(events);
    if (success) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950 dark:border dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Sync Calendar
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Home Base (Default Origin)
            </label>
            <input
              type="text"
              value={homeBase}
              onChange={(e) => setHomeBase(e.target.value)}
              placeholder="e.g. 100 Queen St W"
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-yellow-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
              WebCal ICS Link
            </label>
            <input
              type="url"
              value={icsUrl}
              onChange={(e) => setIcsUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-yellow-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div className="relative flex items-center justify-center">
            <span className="bg-white px-2 text-xs text-zinc-400 dark:bg-zinc-950 z-10">
              OR
            </span>
            <div className="absolute w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Upload .ics File
            </label>
            <input
              type="file"
              accept=".ics"
              onChange={handleFileUpload}
              className="w-full text-sm text-zinc-500 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-400/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-yellow-600 hover:file:bg-yellow-400/20 dark:file:text-yellow-400"
            />
          </div>

          {statusMsg && (
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {statusMsg}
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={isLoading || !homeBase || !icsUrl}
            className="w-full rounded-xl bg-yellow-400 py-3 text-center font-bold text-zinc-900 transition-all hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800"
          >
            {isLoading ? "Syncing..." : "Sync via Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
