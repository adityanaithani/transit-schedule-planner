"use client";

import { useState } from "react";
import { SearchParams } from "./SearchForm";
import { encodeTripParams } from "../lib/urlEncoding";

interface ShareButtonProps {
  params: SearchParams | null;
}

export default function ShareButton({ params }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);

  const handleShare = () => {
    if (!params) return;

    const queryString = encodeTripParams(params);
    const fullUrl = `${window.location.origin}/?${queryString}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  if (!params) return null;

  return (
    <div className="relative">
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {/* Toast Notification */}
      <div 
        className={`absolute bottom-full right-0 z-50 mb-2 w-max rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white shadow-lg transition-all dark:bg-white dark:text-zinc-900 ${
          showToast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        Link copied to clipboard!
      </div>
    </div>
  );
}
