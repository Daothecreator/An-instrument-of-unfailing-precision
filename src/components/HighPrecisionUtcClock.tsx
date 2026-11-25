import React, { useEffect, useState } from 'react';
import {
  formatHighPrecisionUtcSnapshot,
  HighPrecisionUtcSnapshot,
} from '../casl/laplace_causal_contract';
import { Clock } from 'lucide-react';

interface HighPrecisionUtcClockProps {
  laplaceEventCount: number;
  highestLamportClock: number;
}

export const HighPrecisionUtcClock: React.FC<HighPrecisionUtcClockProps> = ({
  laplaceEventCount,
  highestLamportClock,
}) => {
  const [snapshot, setSnapshot] = useState<HighPrecisionUtcSnapshot>(() => {
    const nowMs = Date.now();
    const subMicros =
      typeof performance !== 'undefined'
        ? Math.floor((performance.now() % 1) * 1000)
        : 0;
    return formatHighPrecisionUtcSnapshot(nowMs, subMicros);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const nowMs = Date.now();
      const subMicros =
        typeof performance !== 'undefined'
          ? Math.floor((performance.now() % 1) * 1000)
          : 0;
      setSnapshot(formatHighPrecisionUtcSnapshot(nowMs, subMicros));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="timer"
      aria-label="High-Precision System UTC Bitemporal Clock"
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono tabular-nums"
    >
      <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>{snapshot.utcDatePart}</span>
        <span>{snapshot.utcTimePart}</span>
      </div>
      <span
        aria-hidden="true"
        className="hidden sm:inline text-slate-300 dark:text-slate-700"
      >
        |
      </span>
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <span>T_ns: {snapshot.epochNanoseconds}</span>
        <span aria-hidden="true">·</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
          Laplace L={highestLamportClock} ({laplaceEventCount} Events)
        </span>
      </div>
    </div>
  );
};
