import { Link } from '@tanstack/react-router'
import {
  ShieldAlert,
  AlertTriangle,
  Ban
} from 'lucide-react'

import { MarketingLayout } from './components/MarketingLayout'
import { AmbientBackground } from './components/AmbientBackground'
import { buttonClasses } from '../../components/ui/buttonStyles'

export function SafetyPage() {
  const boundaries = [
    {
      term: 'We do not diagnose or prescribe.',
      explanation:
        'CareCircle coordinates schedules and reminds. It never offers medical advice, diagnostic suggestions, or medication interaction judgements. Always consult a licensed healthcare professional for medical guidance.',
    },
    {
      term: 'We do not auto-order pharmaceuticals without human review.',
      explanation:
        'We provide a verified one-tap telephone and SMS connection to your preferred neighborhood pharmacy. We deliberately do not run autonomous billing or automated fulfillment scripts that can go rogue.',
    },
    {
      term: 'We do not use error-prone OCR scanning to guess dosages.',
      explanation:
        'Computer vision scans on crinkled pill bottles frequently misread "10mg" as "100mg" or mistranscribe look-alike drug names. Medications are entered deliberately with human confirmation.',
    },
    {
      term: 'We do not accept sponsored ads or recommend doctors.',
      explanation:
        'There is no health-problem search bar and no treatment suggestion engine. We do not accept pharmaceutical sponsorships or sell referrals.',
    },
    {
      term: 'We do not claim continuous vital sign telemetry.',
      explanation:
        'CareCircle is a medication and care coordination platform, not an ICU bedside monitor. We coordinate human vigilance rather than creating a false sense of continuous automated surveillance.',
    },
    {
      term: 'We do not confirm doses with ambient voice microphones.',
      explanation:
        'Confirming a dose requires a deliberate physical tap on the phone notification, app screen, or keypad DTMF press. A background TV or casual conversation will never falsely record a pill as taken.',
    },
    {
      term: 'We never sell, monetize, or broker patient health data.',
      explanation:
        'Our business model is a clean subscription SaaS. We do not sell data to health insurers, data brokers, or marketing networks.',
    },
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <AmbientBackground />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-danger-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-danger-700">
            <ShieldAlert className="size-3.5 text-danger-600" aria-hidden="true" />
            Clinical Safety & Boundary Manifesto
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            What CareCircle <br />
            <span className="text-teal-700">deliberately does not do.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700 leading-relaxed">
            In healthcare software, saying what you <strong>will not do</strong> is just as vital as listing your
            features. These are intentional engineering and safety boundaries, not missing features we haven't noticed.
          </p>
        </div>
      </section>

      {/* The Deliberate Boundaries List */}
      <section className="border-b border-cream-300 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="space-y-6">
            {boundaries.map((boundary) => (
              <div
                key={boundary.term}
                className="rounded-2xl border border-cream-300 bg-cream-50 p-6 sm:p-8 shadow-2xs hover:border-cream-400 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-10 place-items-center rounded-xl bg-danger-100 text-danger-700 shrink-0 mt-0.5">
                    <Ban className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink-900">{boundary.term}</h2>
                    <p className="mt-2 text-base text-ink-700 leading-relaxed">{boundary.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Protocol */}
      <section className="border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-danger-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-danger-700">
            <AlertTriangle className="size-3.5 text-danger-600" aria-hidden="true" />
            Emergency Protocol
          </div>
          <h2 className="mt-4 text-3xl font-bold text-ink-900 sm:text-4xl">
            In an Acute Emergency, Call Local Services First
          </h2>
          <p className="mt-4 text-base text-ink-700 leading-relaxed max-w-2xl mx-auto">
            CareCircle’s emergency broadcast alerts your family network immediately, but it is not a replacement for
            official ambulance dispatch. If someone is experiencing chest pains, fall trauma, or acute breathing distress,
            always dial emergency services (911 / 112 / 999) without delay.
          </p>

          <div className="mt-8">
            <Link to="/how-it-works" className={buttonClasses('secondary', 'lg')}>
              Learn how family escalation works
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage-800 text-cream-50 py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Honest software you can trust with your family.</h2>
          <p className="mt-4 text-lg text-sage-200">
            Join thousands of caregivers who prefer radical clarity over marketing exaggeration.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Create Your Care Circle
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
