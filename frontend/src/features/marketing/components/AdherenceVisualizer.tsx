import { CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react'

export interface AdherenceVisualizerProps {
  score?: number
  dosesScheduled?: number
  dosesTaken?: number
  streakDays?: number
  label?: string
}

export function AdherenceVisualizer({
  score = 96,
  dosesScheduled = 28,
  dosesTaken = 27,
  streakDays = 14,
  label = 'Weekly Adherence',
}: AdherenceVisualizerProps) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cream-300 bg-cream-100/90 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-cream-200 pb-3">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sage-700">
          <ShieldCheck className="size-4 text-teal-600" aria-hidden="true" />
          {label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-ok-50 px-2 py-0.5 text-xs font-semibold text-ok-600 border border-ok-100">
          <CheckCircle2 className="size-3" aria-hidden="true" />
          On Track
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
        {/* Animated Radial Ring */}
        <div className="relative grid size-28 place-items-center">
          <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="var(--color-cream-300)"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="var(--color-teal-500)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
              {score}%
            </span>
            <span className="text-[10px] uppercase font-semibold text-ink-500">Adherent</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid flex-1 grid-cols-2 gap-3 text-left w-full sm:w-auto">
          <div className="rounded-xl bg-cream-50 p-3 border border-cream-200">
            <p className="text-xs font-medium text-ink-500">Doses Taken</p>
            <p className="mt-1 text-lg font-bold text-ink-900 tabular-nums">
              {dosesTaken} / {dosesScheduled}
            </p>
            <p className="text-[11px] text-ok-600 font-medium">96.4% verified</p>
          </div>
          <div className="rounded-xl bg-cream-50 p-3 border border-cream-200">
            <p className="text-xs font-medium text-ink-500">Current Streak</p>
            <p className="mt-1 text-lg font-bold text-ink-900 tabular-nums">
              {streakDays} days
            </p>
            <p className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
              <TrendingUp className="size-3" aria-hidden="true" /> Consistent
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-ink-500 italic">
        * Based on timestamped confirmations. Unrecorded doses are reported as missing, never assumed taken.
      </p>
    </div>
  )
}
