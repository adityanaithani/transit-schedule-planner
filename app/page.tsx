"use client";

import { useEffect, useState } from "react";
import PlannerLayout from "../components/PlannerLayout";
import { decodeTripParams } from "../lib/urlEncoding";
import { SearchParams } from "../components/SearchForm";

export default function Home() {
  const [initialParams, setInitialParams] = useState<SearchParams | null>(null);

  useEffect(() => {
    // Read the query string on mount
    const searchParams = new URLSearchParams(window.location.search);
    const decoded = decodeTripParams(searchParams);
    if (decoded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialParams(decoded);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <PlannerLayout initialParams={initialParams} />
    </div>
  );
}
