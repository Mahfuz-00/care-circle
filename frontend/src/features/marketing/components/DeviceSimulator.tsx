import { useState } from 'react'
import {
  Check,
  Clock,
  Pill,
  Shield,
  Smartphone,
  RefreshCw,
  Heart,
  ChevronRight,
  Wifi,
  Battery
} from 'lucide-react'

export function DeviceSimulator() {
  const [activeTab, setActiveTab] = useState<'senior' | 'caregiver'>('senior')
  const [doseTaken, setDoseTaken] = useState(false)
  const [stock, setStock] = useState(14)
  const [showNotification, setShowNotification] = useState(false)
  const [isPressing, setIsPressing] = useState(false)

  const handleTakeDose = () => {
    if (doseTaken) return
    setIsPressing(true)
    setTimeout(() => {
      setIsPressing(false)
      setDoseTaken(true)
      setStock((prev) => Math.max(0, prev - 1))
      setShowNotification(true)

      // Hide notification after 4 seconds
      setTimeout(() => {
        setShowNotification(false)
      }, 4000)
    }, 350)
  }

  const handleReset = () => {
    setDoseTaken(false)
    setStock(14)
    setShowNotification(false)
  }

  return (
    <div className="relative mx-auto max-w-sm sm:max-w-md w-full select-none">
      {/* View Switcher Pill */}
      <div className="mb-4 flex items-center justify-between gap-1.5 rounded-2xl bg-cream-200/90 p-1.5 text-xs font-bold text-ink-700 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('senior')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all ${
            activeTab === 'senior'
              ? 'bg-cream-50 text-sage-900 shadow-sm font-extrabold'
              : 'hover:text-sage-800'
          }`}
        >
          <Smartphone className="size-4 text-teal-700" aria-hidden="true" />
          Senior Mobile View
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('caregiver')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all ${
            activeTab === 'caregiver'
              ? 'bg-cream-50 text-sage-900 shadow-sm font-extrabold'
              : 'hover:text-sage-800'
          }`}
        >
          <Shield className="size-4 text-teal-700" aria-hidden="true" />
          Caregiver Live Watch
        </button>
      </div>

      {/* Titanium Hardware Frame with Glass Highlight */}
      <div className="relative overflow-hidden rounded-[3rem] border-[10px] border-ink-900 bg-cream-50 p-4 shadow-2xl ring-1 ring-white/40">
        {/* Subtle glass reflection sheen */}
        <div className="pointer-events-none absolute -top-40 -right-40 size-80 rounded-full bg-white/30 blur-2xl" />

        {/* Dynamic Island / Camera Notch */}
        <div className="relative mx-auto mb-3 h-6 w-36 rounded-full bg-ink-900 flex items-center justify-between px-3 text-white text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-teal-400 animate-pulse-subtle" />
            <span className="text-[9px] font-mono text-teal-200">ACTIVE</span>
          </div>
          <div className="size-2.5 rounded-full bg-ink-800 border border-ink-700" />
        </div>

        {/* Real-time iOS Drop-Down Notification Banner */}
        {showNotification && (
          <div className="absolute top-12 left-4 right-4 z-30 animate-slide-down-ios">
            <div className="flex items-start gap-3 rounded-2xl bg-ink-900/95 p-3.5 text-cream-50 shadow-2xl backdrop-blur-md border border-white/10">
              <div className="grid size-8 place-items-center rounded-xl bg-ok-500 text-white shrink-0 mt-0.5">
                <Check className="size-4 stroke-[3]" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between text-[11px] text-teal-300 font-bold">
                  <span>CareCircle Sync</span>
                  <span className="text-ink-400">Just now</span>
                </div>
                <p className="font-semibold text-white mt-0.5">
                  Eleanor confirmed Atorvastatin 20mg
                </p>
                <p className="text-[10px] text-ink-300">
                  Recorded at 9:41 AM · Caregiver circle updated
                </p>
              </div>
            </div>
          </div>
        )}

        {/* iOS Status Bar */}
        <div className="mb-4 flex items-center justify-between text-xs font-bold text-ink-700 px-2">
          <span>9:41 AM</span>
          <div className="flex items-center gap-2">
            <Wifi className="size-3.5" />
            <span className="text-[10px] text-teal-700 font-mono">5G</span>
            <Battery className="size-4" />
          </div>
        </div>

        {/* TAB 1: Senior Mobile App View */}
        {activeTab === 'senior' && (
          <div className="space-y-4">
            {/* Senior Header */}
            <div className="rounded-2xl bg-gradient-to-r from-sage-100 to-cream-100 p-4 border border-cream-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-extrabold text-sage-800">
                  Morning Regimen
                </p>
                <h4 className="text-xl font-extrabold text-ink-900">Eleanor Parker</h4>
              </div>
              <div className="relative size-11 rounded-2xl bg-sage-700 text-cream-50 flex items-center justify-center font-extrabold text-base shadow-sm">
                EP
                <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-ok-500 border-2 border-white" />
              </div>
            </div>

            {/* Scheduled Dose Interactive Card */}
            <div
              className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-500 p-5 ${
                doseTaken
                  ? 'border-ok-500 bg-ok-50/80 shadow-md'
                  : 'border-sage-400 bg-cream-50 shadow-lg'
              }`}
            >
              {/* Overdue / Due Now Chip */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    doseTaken
                      ? 'bg-ok-100 text-ok-700 border border-ok-200'
                      : 'bg-teal-100 text-teal-800 border border-teal-200'
                  }`}
                >
                  <Clock className="size-3.5" aria-hidden="true" />
                  {doseTaken ? 'Taken at 9:41 AM' : 'Due Now · 9:30 AM'}
                </span>
                <span className="text-xs font-bold text-ink-500 tabular-nums">
                  {stock} pills left
                </span>
              </div>

              {/* Pill Info */}
              <div className="mt-4 flex items-start gap-3.5">
                <div
                  className={`mt-1 grid size-12 place-items-center rounded-2xl transition-all ${
                    doseTaken
                      ? 'bg-ok-500 text-white animate-pulse-subtle'
                      : 'bg-sage-100 text-sage-800'
                  }`}
                >
                  <Pill className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <h5 className="text-2xl font-extrabold text-ink-900 leading-tight">
                    Atorvastatin
                  </h5>
                  <p className="text-sm font-bold text-ink-700">
                    20mg · 1 tablet with full glass of water
                  </p>
                  <p className="text-xs text-ink-500 mt-1">
                    Daily cholesterol maintenance
                  </p>
                </div>
              </div>

              {/* The Tactile One-Tap Button */}
              <div className="mt-6">
                {doseTaken ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-ok-600 py-4 text-base font-bold text-white shadow-lg animate-pulse-subtle">
                    <Check className="size-6 stroke-[3]" aria-hidden="true" />
                    <span>Dose Verified & Logged</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTakeDose}
                    disabled={isPressing}
                    className={`w-full relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold text-cream-50 transition-all shadow-md active:scale-95 ${
                      isPressing
                        ? 'bg-sage-600 scale-98'
                        : 'bg-sage-700 hover:bg-sage-800'
                    }`}
                    style={{ minHeight: '56px' }}
                  >
                    <Check className="size-6 stroke-[3]" aria-hidden="true" />
                    <span>{isPressing ? 'Confirming...' : 'I took it'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Emergency Lifeline Button (Always reachable) */}
            <div className="pt-1">
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-2xl border border-danger-200 bg-danger-50/80 p-4 text-left text-danger-700 hover:bg-danger-100 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-danger-600 text-white font-bold shadow-sm">
                    <Heart className="size-6" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block font-extrabold text-danger-700 text-sm">
                      Need help right now?
                    </span>
                    <span className="block text-xs text-danger-600">
                      Alerts Sarah & Michael immediately
                    </span>
                  </div>
                </div>
                <ChevronRight className="size-5 text-danger-500" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Caregiver Live Radar View */}
        {activeTab === 'caregiver' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-sage-800 text-cream-50 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-sage-200">
                  Remote Radar
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-500/20 px-2.5 py-0.5 text-xs font-bold text-ok-100 border border-ok-500/30">
                  <span className="size-2 rounded-full bg-ok-400 animate-pulse-subtle" />
                  All Safe
                </span>
              </div>
              <h4 className="mt-2 text-xl font-extrabold">Eleanor's Status</h4>
              <p className="text-xs text-sage-200 mt-0.5">Quiet vigilance active · Next dose 6:00 PM</p>
            </div>

            {/* Live Feed Event */}
            <div className="rounded-2xl border border-cream-300 bg-cream-100 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-500 font-bold">
                <span>Recent Event Stream</span>
                <span className="text-teal-700 font-mono">REAL-TIME</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-cream-50 p-3 border border-cream-200 shadow-2xs">
                <div
                  className={`mt-0.5 grid size-7 place-items-center rounded-full text-white text-xs font-bold ${
                    doseTaken ? 'bg-ok-500' : 'bg-warn-500 animate-pulse-subtle'
                  }`}
                >
                  {doseTaken ? '✓' : '!'}
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-extrabold text-ink-900">
                    {doseTaken
                      ? 'Atorvastatin 20mg confirmed'
                      : 'Atorvastatin 20mg due for confirmation'}
                  </p>
                  <p className="text-ink-500 mt-0.5">
                    {doseTaken
                      ? 'Recorded via one-tap mobile confirmation at 9:41 AM'
                      : 'Scheduled for 9:30 AM · Escalation gate in 19m'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pill Stock Gauge */}
            <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-ink-900">Burndown Prediction</span>
                <span className="font-bold text-teal-700 tabular-nums">
                  {stock} of 30 tablets
                </span>
              </div>
              <div className="mt-2.5 h-3 w-full rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stock / 30) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-ink-500">
                14 days remaining. Automatic refill alert scheduled for day 7.
              </p>
            </div>
          </div>
        )}

        {/* Reset Interactive Demo State */}
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-cream-200 text-xs text-ink-500">
          <span>Interactive tactile demo</span>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 font-bold text-sage-700 hover:text-sage-900 transition-colors"
          >
            <RefreshCw className="size-3" aria-hidden="true" />
            Reset demo
          </button>
        </div>
      </div>
    </div>
  )
}
