import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Pill,
  Users,
  Calendar,
  HeartPulse,
  Phone,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react'

import { MarketingLayout } from './components/MarketingLayout'
import { AmbientBackground } from './components/AmbientBackground'
import { buttonClasses } from '../../components/ui/buttonStyles'

export function FeaturesPage() {
  const [interactivePills, setInteractivePills] = useState(24)
  const [dailyDose] = useState(2)

  const daysRemaining = Math.floor(interactivePills / dailyDose)
  const isLowStock = daysRemaining <= 7

  const handleSimulateDose = () => {
    if (interactivePills > 0) {
      setInteractivePills((prev) => Math.max(0, prev - dailyDose))
    }
  }

  const handleRefill = () => {
    setInteractivePills(30)
  }

  const features = [
    {
      category: 'Medication Management',
      icon: Pill,
      title: 'Precision Scheduling & Stock Intelligence',
      description: 'Everything a family or senior needs to stay on regimen without confusion or sudden stockouts.',
      points: [
        'Complex regimens: daily, alternate days, specific weekdays, or "with food" instructions',
        'Time windows with customizable grace periods so you are never rushed',
        'Automatic "days remaining" forecasting that decrements with every recorded dose',
        'Low-stock threshold triggers that notify both senior and caregivers days in advance',
        'Photo verification support to ensure pills match the bottle',
      ],
    },
    {
      category: 'Care Relationships',
      icon: Users,
      title: 'Unified Care Circles with Role-Based Access',
      description: 'One patient surrounded by a synchronized ring of support, declared with strict least-privilege.',
      points: [
        'Dedicated roles: Senior, Primary Caregiver, Secondary Caregiver, and Self-User',
        'Primary caregiver manages circle invites, schedules, and pharmacy contacts',
        'Secondary caregivers receive emergency escalation without modifying prescriptions',
        'Complete transparency: seniors can always view exactly who has access to their data',
      ],
    },
    {
      category: 'Appointments & Consultations',
      icon: Calendar,
      title: 'Doctor Visits & Lab Coordination',
      description: 'Never miss a specialist visit, routine blood draw, or physical therapy session.',
      points: [
        'Scheduled dates, clinic addresses, clinician contact, and custom prep instructions',
        'Configurable multi-stage reminder notices (48h, 24h, and morning-of)',
        'Shared visibility so adult children can coordinate transportation and accompaniment',
      ],
    },
    {
      category: 'Emergency Lifeline',
      icon: HeartPulse,
      title: 'Prominent One-Touch Emergency Broadcast',
      description: 'Immediate coordination when moments matter during falls, acute pain, or sudden distress.',
      points: [
        'Unmissable, permanent button on senior mobile screen (exceeds 96dp minimum size)',
        'Instantly alerts all configured circle members via push, SMS, and high-priority flags',
        'Records the first responder acknowledgement and elapsed response time',
        'Direct link to contact local emergency services if immediate dispatch is necessary',
      ],
    },
    {
      category: 'Pharmacy Integration',
      icon: Phone,
      title: 'Preferred Pharmacy Quick-Connect',
      description: 'Direct line to your trusted neighborhood pharmacist for seamless refill orders.',
      points: [
        'Store prescription number, pharmacy name, and verified direct telephone',
        'One-tap dialer and SMS trigger from both caregiver dashboard and senior app',
        'Pre-formatted refill request messages ready to send in seconds',
      ],
    },
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <AmbientBackground />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            <Sparkles className="size-3.5 text-teal-700" aria-hidden="true" />
            Complete MVP Feature Set
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Built for real households, <br />
            <span className="text-teal-700">not ideal laboratory conditions.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700 leading-relaxed">
            Medication adherence isn't just about sounding an alarm. It's about ensuring the medicine is actually in the
            cabinet, the right caregiver is alerted when something slips, and doctor visits are remembered together.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Get started with CareCircle
            </Link>
            <Link to="/pricing" className={buttonClasses('secondary', 'lg')}>
              View plans & tiers
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Stock & Refill Forecast Simulator */}
      <section className="border-b border-cream-300 py-16 sm:py-20 bg-cream-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-cream-300 bg-cream-100 p-6 sm:p-10 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Interactive Demo
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-ink-900">
                  Stock That Never Runs Out Silently
                </h2>
                <p className="mt-3 text-base text-ink-700">
                  Clinical research identifies the invisible stockout as one of healthcare's greatest silent failures. CareCircle
                  calculates exact remaining burn-down and fires proactive refill notices to caregivers.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSimulateDose}
                    disabled={interactivePills === 0}
                    className="flex items-center gap-2 rounded-xl bg-sage-700 px-4 py-2.5 text-sm font-bold text-cream-50 hover:bg-sage-800 active:scale-97 transition-all shadow-sm"
                  >
                    <Pill className="size-4" aria-hidden="true" />
                    Simulate Daily Dose (-2 pills)
                  </button>
                  <button
                    type="button"
                    onClick={handleRefill}
                    className="flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-cream-200 transition-colors"
                  >
                    Refill Bottle (+30 pills)
                  </button>
                </div>
              </div>

              {/* Dynamic Pill Meter Card */}
              <div className="rounded-2xl border border-cream-300 bg-cream-50 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                  <div>
                    <h3 className="font-bold text-ink-900 text-lg">Metformin Hydrochloride</h3>
                    <p className="text-xs text-ink-500">500mg · 2 tablets / day</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      isLowStock
                        ? 'bg-warn-100 text-warn-600 border border-warn-200'
                        : 'bg-ok-100 text-ok-600 border border-ok-200'
                    }`}
                  >
                    {isLowStock ? 'Low Stock Warning' : 'Adequate Supply'}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-ink-900 tabular-nums">
                        {interactivePills}
                      </span>
                      <span className="text-sm font-semibold text-ink-500 ml-1.5">tablets left</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-teal-700 tabular-nums">
                        {daysRemaining}
                      </span>
                      <span className="text-xs font-semibold text-ink-500 ml-1">days remaining</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-3 w-full rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLowStock ? 'bg-warn-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, (interactivePills / 30) * 100)}%` }}
                    />
                  </div>

                  <div className="rounded-xl bg-cream-100 p-3 text-xs text-ink-700 flex items-start gap-2">
                    <ShieldCheck className="size-4 text-teal-700 mt-0.5 shrink-0" />
                    <span>
                      {isLowStock
                        ? 'Proactive notification sent to Primary Caregiver: Refill recommended within 48 hours.'
                        : 'Stock is healthy. Refill reminder scheduled for 7 days before depletion.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="border-b border-cream-300 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="space-y-16">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.category}
                  className={`grid gap-8 lg:grid-cols-2 items-center ${
                    idx % 2 === 1 ? 'lg:grid-flow-dense' : ''
                  }`}
                >
                  <div className={idx % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-sage-100 px-3 py-1 text-xs font-bold text-sage-800">
                      <Icon className="size-4" aria-hidden="true" />
                      {feature.category}
                    </div>
                    <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-ink-900">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-base text-ink-700 leading-relaxed">
                      {feature.description}
                    </p>

                    <ul className="mt-6 space-y-2.5">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-sm text-ink-700">
                          <CheckCircle2 className="size-4 text-teal-600 mt-0.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={idx % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <div className="rounded-3xl border border-cream-300 bg-cream-100 p-8 shadow-sm">
                      <div className="grid size-16 place-items-center rounded-2xl bg-teal-100 text-teal-800 mb-6">
                        <Icon className="size-8" />
                      </div>
                      <h4 className="text-xl font-bold text-ink-900 mb-2">Designed for Confidence</h4>
                      <p className="text-sm text-ink-700 leading-relaxed">
                        Every feature in CareCircle is engineered for real-world reliability. Nothing is added for
                        show, and every screen is tested against real family coordination workflows.
                      </p>
                      <div className="mt-6 pt-4 border-t border-cream-200 flex items-center justify-between text-xs font-semibold text-sage-800">
                        <span>Certified Quality</span>
                        <span className="text-teal-700">Server Enforced</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage-800 text-cream-50 py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Experience the complete care coordination suite.</h2>
          <p className="mt-4 text-lg text-sage-200">
            Set up schedules, add trusted caregivers, and achieve complete medication peace of mind.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Start Free Care Circle
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
