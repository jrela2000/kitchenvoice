import { Timer, Pause, Play, X } from 'lucide-react';
import { formatDuration } from '@/lib/convert';

export default function TimerBanner({ seconds, active, onPause, onResume, onClear }) {
  if (!seconds) return null;
  return (
    <div className="mx-auto mb-4 flex items-center justify-between gap-3 rounded-2xl bg-primary text-primary-foreground px-5 py-3 shadow-md max-w-md">
      <span className="inline-flex items-center gap-2 font-semibold">
        <Timer size={22} /> Timer
      </span>
      <span className="text-3xl font-mono font-bold tabular-nums">{formatDuration(seconds)}</span>
      <span className="flex items-center gap-2">
        {active ? (
          <button onClick={onPause} aria-label="Pause timer" className="rounded-full p-2 hover:bg-white/20">
            <Pause size={22} />
          </button>
        ) : (
          <button onClick={onResume} aria-label="Resume timer" className="rounded-full p-2 hover:bg-white/20">
            <Play size={22} />
          </button>
        )}
        <button onClick={onClear} aria-label="Clear timer" className="rounded-full p-2 hover:bg-white/20">
          <X size={22} />
        </button>
      </span>
    </div>
  );
}