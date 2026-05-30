"use client";

interface DateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export default function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  return (
    <div className="flex w-full gap-4">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Departure Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-base shadow-sm outline-none transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Time
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-base shadow-sm outline-none transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
        />
      </div>
    </div>
  );
}
