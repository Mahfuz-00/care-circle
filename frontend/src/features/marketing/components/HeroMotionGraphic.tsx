import { useState, useEffect } from 'react'
import {
  Check,
  Clock,
  Pill,
  Shield,
  PhoneCall,
  Wifi,
  Battery,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  Users
} from 'lucide-react'

type Scenario = 'on_time' | 'escalation' | 'refill'

export function HeroMotionGraphic() {
  const [scenario, setScenario] = useState<Scenario>('on_time')
  const [isPlaying, setIsPlaying] = useState(true)
  const [doseTaken, setDoseTaken] = useState(false)
  const [stock, setStock] = useState(14)
  const [showNotification, setShowNotification] = useState(false)

  const selectScenario = (next: Scenario, pause = false) => {
    if (pause) setIsPlaying(false)
    setScenario(next)
    if (next === 'on_time') {
      setDoseTaken(false)
      setShowNotification(false)
      setStock(14)
    } else if (next === 'escalation') {
      setDoseTaken(false)
      setShowNotification(false)
      setStock(14)
    } else {
      setDoseTaken(true)
      setShowNotification(false)
      setStock(4)
    }
  }

  // Auto-play cycling between scenarios smoothly
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setScenario((prev) => {
        const next: Scenario = prev === 'on_time' ? 'escalation' : prev === 'escalation' ? 'refill' : 'on_time'
        if (next === 'on_time') {
          setDoseTaken(false)
          setShowNotification(false)
          setStock(14)
        } else if (next === 'escalation') {
          setDoseTaken(false)
          setShowNotification(false)
        } else {
          setDoseTaken(true)
          setShowNotification(false)
          setStock(4)
        }
        return next
      })
    }, 6500)
    return () => clearInterval(interval)
  }, [isPlaying])

  // Timed dose confirmation for on_time scenario
  useEffect(() => {
    if (scenario === 'on_time' && !doseTaken) {
      const timer = setTimeout(() => {
        setDoseTaken(true)
        setShowNotification(true)
        setStock(13)
      }, 1600)
      return () => clearTimeout(timer)
    }
  }, [scenario, doseTaken])

  const handleManualDose = () => {
    setDoseTaken(true)
    setStock((prev) => Math.max(0, prev - 1))
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3500)
  }

  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-md select-none">
      {/* Soft Ambient Radial Backlight */}
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-full bg-gradient-to-tr from-sky-400/15 via-teal-400/10 to-indigo-500/15 blur-2xl opacity-70" />

      {/* Reorganized Minimalist Scenario Pill Switcher */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-cream-200 bg-cream-100/90 p-1.5 shadow-2xs backdrop-blur-md">
        <div className="flex flex-1 items-center gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => selectScenario('on_time', true)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer ${
              scenario === 'on_time'
                ? 'bg-cream-50 text-teal-800 shadow-xs font-extrabold'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <Check className="size-3.5 text-ok-600 stroke-[3]" />
            <span>On-Time</span>
          </button>

          <button
            type="button"
            onClick={() => selectScenario('escalation', true)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer ${
              scenario === 'escalation'
                ? 'bg-cream-50 text-amber-800 shadow-xs font-extrabold'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <PhoneCall className="size-3.5 text-amber-600" />
            <span>Voice Check</span>
          </button>

          <button
            type="button"
            onClick={() => selectScenario('refill', true)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer ${
              scenario === 'refill'
                ? 'bg-cream-50 text-teal-800 shadow-xs font-extrabold'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <Pill className="size-3.5 text-teal-700" />
            <span>Auto-Refill</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="ml-1.5 p-2 rounded-xl text-ink-500 hover:text-ink-900 hover:bg-cream-200/60 transition-colors cursor-pointer"
          title={isPlaying ? 'Pause interactive preview' : 'Resume auto-play preview'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 text-teal-700" />}
        </button>
      </div>

      {/* Clean Device Framing */}
      <div className="relative">
        {/* Subtle Floating Chip 1: Top Right */}
        <div className="hidden sm:inline-flex absolute -top-3 -right-3 z-20 items-center gap-1.5 rounded-full border border-cream-200 bg-cream-50/95 px-3 py-1 shadow-md backdrop-blur-md text-[11px] font-bold text-ink-700 animate-float-gentle">
          <Users className="size-3.5 text-teal-700" />
          <span>Care Circle Synced</span>
          <span className="size-1.5 rounded-full bg-ok-500 animate-pulse-subtle" />
        </div>

        {/* Central Smartphone Hardware Chassis */}
        <div className="relative overflow-hidden rounded-[2.8rem] border-[8px] border-ink-900 bg-cream-50 p-4 shadow-2xl ring-1 ring-white/60">
          {/* Titanium Rim Highlight */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-white/35 blur-xl" />

          {/* Dynamic Island */}
          <div className="relative mx-auto mb-2.5 h-5 w-32 rounded-full bg-ink-900 flex items-center justify-between px-3 text-white text-[9px] shadow-inner">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${
                  scenario === 'escalation'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-teal-400 animate-pulse-subtle'
                }`}
              />
              <span className="font-mono text-teal-200">
                {scenario === 'escalation' ? 'CHECK-IN' : 'SAFE'}
              </span>
            </div>
            <div className="size-2 rounded-full bg-ink-800" />
          </div>

          {/* iOS Notification Banner Drop */}
          {showNotification && (
            <div className="absolute top-10 left-3 right-3 z-30 animate-slide-down-ios">
              <div className="flex items-start gap-2.5 rounded-2xl bg-ink-900/95 p-3 text-cream-50 shadow-xl backdrop-blur-md border border-white/10">
                <div className="grid size-6 place-items-center rounded-lg bg-ok-500 text-white shrink-0 mt-0.5">
                  <Check className="size-3.5 stroke-[3]" />
                </div>
                <div className="flex-1 text-[11px] leading-tight">
                  <div className="flex items-center justify-between font-bold text-teal-300 text-[10px]">
                    <span>Dose Confirmed</span>
                    <span className="text-ink-400 font-normal">Just now</span>
                  </div>
                  <p className="font-semibold text-white mt-0.5">
                    Eleanor confirmed Atorvastatin 20mg
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* iOS Status Bar */}
          <div className="mb-3 flex items-center justify-between text-xs font-bold text-ink-700 px-1">
            <span>9:41 AM</span>
            <div className="flex items-center gap-1.5 text-ink-700">
              <Wifi className="size-3.5" />
              <Battery className="size-3.5" />
            </div>
          </div>

          {/* Senior Profile Strip */}
          <div className="rounded-2xl bg-gradient-to-r from-sage-100 to-cream-100 p-3 border border-cream-200 flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-sage-800">
                Morning Regimen
              </p>
              <h4 className="text-base font-extrabold text-ink-900">Eleanor Parker</h4>
            </div>
            <div className="relative size-9 rounded-xl bg-sage-700 text-cream-50 flex items-center justify-center font-bold text-xs shadow-xs">
              EP
              <span
                className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-white ${
                  scenario === 'escalation' ? 'bg-amber-500 animate-ping' : 'bg-ok-500'
                }`}
              />
            </div>
          </div>

          {/* SCENARIO 1: ON-TIME DOSE */}
          {scenario === 'on_time' && (
            <div className="space-y-3">
              <div
                className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
                  doseTaken
                    ? 'border-ok-500 bg-ok-50/70 shadow-xs'
                    : 'border-sage-300 bg-cream-50 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${
                      doseTaken
                        ? 'bg-ok-100 text-ok-700 border border-ok-200'
                        : 'bg-teal-100 text-teal-800 border border-teal-200'
                    }`}
                  >
                    <Clock className="size-3" />
                    {doseTaken ? 'Taken · 9:41 AM' : 'Due Now · 9:30 AM'}
                  </span>
                  <span className="font-bold text-ink-500 tabular-nums">
                    {stock} pills left
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <div
                    className={`grid size-10 place-items-center rounded-xl transition-all ${
                      doseTaken ? 'bg-ok-500 text-white' : 'bg-sage-100 text-sage-800'
                    }`}
                  >
                    <Pill className="size-5" />
                  </div>
                  <div>
                    <h5 className="text-lg font-extrabold text-ink-900 leading-tight">
                      Atorvastatin 20mg
                    </h5>
                    <p className="text-xs text-ink-700 font-medium">
                      1 tablet with full glass of water
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {doseTaken ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-ok-600 py-3 text-xs font-bold text-white shadow-xs">
                      <Check className="size-4 stroke-[3]" />
                      <span>Verified & Recorded</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleManualDose}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-sage-700 py-3 text-sm font-bold text-cream-50 hover:bg-sage-800 active:scale-97 transition-all shadow-sm cursor-pointer"
                    >
                      <Check className="size-4 stroke-[3]" />
                      <span>I took my medicine</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO 2: GENTLE VOICE CALL ESCALATION */}
          {scenario === 'escalation' && (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/80 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/70 px-2.5 py-0.5 font-bold text-amber-900">
                    <AlertTriangle className="size-3 text-amber-700" />
                    Automated Voice Reminder
                  </span>
                  <span className="font-mono font-bold text-amber-800 text-[11px]">+18m Window</span>
                </div>

                <div>
                  <h5 className="text-lg font-extrabold text-ink-900 leading-tight">
                    Metformin 500mg
                  </h5>
                  <p className="text-xs text-ink-700">Scheduled for 9:15 AM · Morning dose</p>
                </div>

                {/* Simulated Calm Call Card */}
                <div className="rounded-xl bg-ink-900 p-3 text-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-teal-300 font-bold">
                      <Volume2 className="size-3.5 text-teal-400 animate-pulse" />
                      Calm Check-in Call
                    </span>
                    {/* Bouncing Equalizer Wave Bars */}
                    <div className="flex items-end gap-0.5 h-3">
                      {[6, 12, 8, 14, 7].map((h, i) => (
                        <span
                          key={i}
                          className="w-0.5 bg-teal-400 rounded-full animate-pulse"
                          style={{ height: `${h}px`, animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-ink-200 leading-tight">
                    "Hi Eleanor, press 1 on your keypad to confirm your morning Metformin."
                  </p>
                  <button
                    type="button"
                    onClick={() => selectScenario('on_time', true)}
                    className="w-full rounded-lg bg-ok-600 py-2 text-center text-xs font-bold text-white hover:bg-ok-700 cursor-pointer"
                  >
                    Press 1 to Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO 3: SMART REFILL BURNDOWN */}
          {scenario === 'refill' && (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-teal-600 bg-cream-100 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-warn-100 px-2 py-0.5 font-bold text-warn-600 border border-warn-200">
                    <AlertTriangle className="size-3" />
                    Low Supply (≤ 5 Days)
                  </span>
                  <span className="font-bold text-ink-900 tabular-nums">4 pills left</span>
                </div>

                <div>
                  <h5 className="text-lg font-extrabold text-ink-900 leading-tight">
                    Lisinopril 10mg
                  </h5>
                  <p className="text-xs text-ink-700">Daily blood pressure maintenance</p>
                </div>

                {/* Pill Stock Tube Meter */}
                <div className="rounded-xl bg-cream-50 p-2.5 border border-cream-200">
                  <div className="flex justify-between text-[11px] font-bold text-ink-700 mb-1">
                    <span>Stock Burndown:</span>
                    <span className="text-warn-600 font-extrabold">4 Days Remaining</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className="h-full bg-warn-500 rounded-full transition-all duration-500"
                      style={{ width: '15%' }}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-teal-800 text-cream-50 p-2.5 text-xs">
                  <p className="font-bold text-teal-200 text-[11px]">Walgreens Pharmacy #4920</p>
                  <p className="text-[11px] text-teal-100 mt-0.5">
                    Proactive refill alert sent to family caregivers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subtle Floating Chip 2: Bottom Left */}
        <div className="hidden sm:inline-flex absolute -bottom-3 -left-3 z-20 items-center gap-1.5 rounded-full border border-cream-200 bg-cream-50/95 px-3 py-1 shadow-md backdrop-blur-md text-[11px] font-bold text-ink-700 animate-float-gentle">
          <Shield className="size-3.5 text-teal-700" />
          <span>Private Family Vault</span>
        </div>
      </div>
    </div>
  )
}
