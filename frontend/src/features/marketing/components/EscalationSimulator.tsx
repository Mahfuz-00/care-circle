import { useState, useEffect } from 'react'
import {
  Bell,
  PhoneCall,
  UserCheck,
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2
} from 'lucide-react'

interface Stage {
  id: number
  time: string
  title: string
  channel: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'pending' | 'active' | 'success'
  auditReason: string
}

const STAGES: Stage[] = [
  {
    id: 1,
    time: '0 min',
    title: 'Scheduled Window',
    channel: 'In-App Gentle Prompt',
    description: 'Scheduled dose window opens. Silent, respectful banner rendered on patient app.',
    icon: Clock,
    status: 'pending',
    auditReason: 'dose.scheduled_window_opened',
  },
  {
    id: 2,
    time: '+15 min',
    title: 'High-Priority Push',
    channel: 'System Push Notification',
    description: 'Server evaluates safety gates (overdue, priority=high). High-priority push dispatched.',
    icon: Bell,
    status: 'pending',
    auditReason: 'notification.push_dispatched',
  },
  {
    id: 3,
    time: '+30 min',
    title: 'Automated Voice Check',
    channel: 'Interactive Telephone Call',
    description: 'Outside quiet hours. Places a calm telephone call with DTMF keypad confirmation.',
    icon: PhoneCall,
    status: 'active',
    auditReason: 'voice.call_placed_dtmf_ready',
  },
  {
    id: 4,
    time: '+45 min',
    title: 'Caregiver Escalation',
    channel: 'Family Circle Alert',
    description: 'Voice attempt unconfirmed. Primary caregiver (Sarah) notified with direct reach-out options.',
    icon: UserCheck,
    status: 'active',
    auditReason: 'escalation.caregiver_notified',
  },
  {
    id: 5,
    time: 'Real-Time',
    title: 'Immutable Audit Log',
    channel: 'Tamperproof Verification Record',
    description: 'Every decision, skip, and channel attempt permanently logged with actor and timestamp.',
    icon: FileText,
    status: 'success',
    auditReason: 'audit_log.committed_tamperproof',
  },
]

export function EscalationSimulator() {
  const [currentStep, setCurrentStep] = useState(2)
  const [isPlaying, setIsPlaying] = useState(false)

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STAGES.length - 1 ? prev + 1 : 0))
    }, 2800)
    return () => clearInterval(timer)
  }, [isPlaying])

  const activeStage = STAGES[currentStep]

  const handleNext = () => {
    setCurrentStep((prev) => (prev < STAGES.length - 1 ? prev + 1 : 0))
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  return (
    <div className="rounded-3xl border border-cream-300 bg-cream-100 p-6 sm:p-10 shadow-sm relative overflow-hidden select-none">
      {/* Background Ambient Radar Grid */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full border border-teal-200/50 opacity-40 animate-radar-scan" />

      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3.5 py-1 text-xs font-bold text-teal-800">
            <ShieldAlert className="size-3.5" aria-hidden="true" />
            Multi-Channel Fail-Safe Engine
          </span>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink-900">
            The Non-Aggressive Escalation Pipeline
          </h3>
          <p className="mt-1 text-sm text-ink-700">
            Click through stages or play the simulation to see how the server evaluates gates before escalating.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all shadow-sm ${
              isPlaying
                ? 'bg-warn-600 text-white'
                : 'bg-sage-700 text-cream-50 hover:bg-sage-800'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="size-3.5" /> Auto-Play
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-xl border border-cream-300 bg-cream-50 px-3.5 py-2.5 text-xs font-bold text-ink-700 hover:bg-cream-200 transition-colors"
          >
            Next Stage
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-cream-300 bg-cream-50 p-2.5 text-ink-700 hover:bg-cream-200 transition-colors"
            title="Reset simulation"
            aria-label="Reset simulation"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* Interactive Signal Flow Timeline */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5 relative z-10">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon
          const isSelected = idx === currentStep
          const isPassed = idx < currentStep

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => {
                setCurrentStep(idx)
                setIsPlaying(false)
              }}
              className={`group flex flex-col items-center rounded-2xl p-4 text-center transition-all ${
                isSelected
                  ? 'bg-cream-50 ring-2 ring-teal-500 shadow-md scale-102'
                  : isPassed
                  ? 'bg-cream-200/60 hover:bg-cream-200'
                  : 'bg-cream-100 hover:bg-cream-200/50 opacity-60'
              }`}
            >
              <div
                className={`grid size-12 place-items-center rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-lg animate-pulse-subtle'
                    : isPassed
                    ? 'bg-sage-700 text-cream-50'
                    : 'bg-cream-300 text-ink-500'
                }`}
              >
                <Icon className="size-6" />
              </div>
              <span className="mt-3 text-xs font-extrabold tabular-nums text-sage-800">
                {stage.time}
              </span>
              <span className="text-xs font-bold text-ink-900 mt-0.5 leading-tight">
                {stage.title}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cinematic Live Stage Visualizer Card */}
      <div className="mt-8 rounded-3xl border border-cream-300 bg-cream-50 p-6 sm:p-8 shadow-sm relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cream-200 pb-5">
          <div className="flex items-center gap-4">
            <div className="relative grid size-14 place-items-center rounded-2xl bg-teal-100 text-teal-800 font-bold shrink-0">
              <activeStage.icon className="size-7" />
              {/* Radar pulse around icon */}
              <span className="absolute inset-0 rounded-2xl ring-2 ring-teal-400 animate-ping opacity-40" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
                  {activeStage.channel}
                </span>
                <span className="text-xs font-semibold text-ink-500">· Overdue Window: {activeStage.time}</span>
              </div>
              <h4 className="text-2xl font-extrabold text-ink-900 mt-0.5">{activeStage.title}</h4>
            </div>
          </div>

          {/* Animated Audio Equalizer Waveform for Voice Stage */}
          {currentStep === 2 && (
            <div className="flex items-center gap-2 rounded-2xl bg-sage-800 px-4 py-2 text-cream-50 shadow-sm">
              <Volume2 className="size-4 text-teal-300 animate-pulse-subtle" />
              <div className="flex items-center gap-1 h-6 px-1">
                <span className="w-1 bg-teal-400 rounded-full animate-[audio-bounce_0.8s_ease-in-out_infinite]" />
                <span className="w-1 bg-teal-300 rounded-full animate-[audio-bounce_1.1s_ease-in-out_infinite]" />
                <span className="w-1 bg-teal-200 rounded-full animate-[audio-bounce_0.6s_ease-in-out_infinite]" />
                <span className="w-1 bg-teal-400 rounded-full animate-[audio-bounce_0.9s_ease-in-out_infinite]" />
                <span className="w-1 bg-teal-300 rounded-full animate-[audio-bounce_1.2s_ease-in-out_infinite]" />
              </div>
              <span className="text-xs font-mono font-bold text-teal-200">VOICE ACTIVE</span>
            </div>
          )}

          <div className="rounded-xl bg-cream-100 px-3.5 py-1.5 border border-cream-200 text-xs font-mono text-ink-700">
            Server decision: <span className="font-bold text-sage-800">{activeStage.auditReason}</span>
          </div>
        </div>

        <p className="mt-5 text-base text-ink-700 leading-relaxed max-w-3xl">
          {activeStage.description}
        </p>

        {/* Server Gates Verification Checklist */}
        <div className="mt-6 rounded-2xl bg-cream-100 p-5 border border-cream-200">
          <p className="text-xs font-bold uppercase tracking-wider text-sage-800 mb-3">
            Server Safety Gates Verified
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2 text-xs text-ink-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-ok-600 shrink-0" />
              <span>Gate 1: Scheduled window fully elapsed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-ok-600 shrink-0" />
              <span>Gate 2: Medication flagged for escalation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-ok-600 shrink-0" />
              <span>Gate 3: Household is outside configured sleep quiet hours</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-ok-600 shrink-0" />
              <span>Gate 4: Circle daily dispatch budget has remaining quota</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
