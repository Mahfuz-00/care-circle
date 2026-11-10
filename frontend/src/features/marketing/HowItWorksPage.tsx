import { Link } from '@tanstack/react-router'
import {
  Clock,
  CheckCircle2,
  Database
} from 'lucide-react'

import { MarketingLayout } from './components/MarketingLayout'
import { EscalationSimulator } from './components/EscalationSimulator'
import { AmbientBackground } from './components/AmbientBackground'
import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody } from '../../components/ui/Card'

export function HowItWorksPage() {
  const gates = [
    {
      number: '01',
      title: 'Dose Genuinely Overdue',
      description: 'Reminders never dispatch early or guess intent. The scheduled window must fully lapse before escalation starts.',
    },
    {
      number: '02',
      title: 'High-Priority Medication',
      description: 'Only vital medications flagged by the care circle trigger telephone voice calls or family escalation.',
    },
    {
      number: '03',
      title: 'Explicit Recipient Consent',
      description: 'SMS and voice channels require verified numbers and explicit opt-in. Nothing is phoned uninvited.',
    },
    {
      number: '04',
      title: 'Household Quiet Hours',
      description: 'Configured sleep windows (e.g. 10:00 PM – 7:30 AM) strictly mute all non-critical notifications on the server.',
    },
    {
      number: '05',
      title: 'Generous Attempt Spacing',
      description: 'Strict rate limits with minimum 15-minute buffers prevent alarm fatigue and respectful breathing room.',
    },
    {
      number: '06',
      title: 'Circle Daily Budget',
      description: 'A hard daily cap ensures automated calls never overwhelm or create anxiety in a senior’s household.',
    },
  ]

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <AmbientBackground />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-sage-200/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sage-900">
            <Clock className="size-3.5 text-teal-700" aria-hidden="true" />
            Automated Protocol Specification
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Escalation engineered to protect, <br />
            <span className="text-teal-700">never to nag.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700 leading-relaxed">
            Most reminder apps shout loudly into an empty room or drain phone batteries until they are swiped away and
            ignored. CareCircle uses a server-enforced cascade: quiet in-app cues first, high-priority push second, a calm
            voice check third, and family circle escalation only when something is genuinely wrong.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Set up your escalation rules
            </Link>
            <Link to="/features" className={buttonClasses('secondary', 'lg')}>
              Explore all features
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Motion Graphic Simulator */}
      <section className="border-b border-cream-300 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-ink-900 sm:text-4xl">
              Experience the Escalation Pipeline
            </h2>
            <p className="mt-3 text-base text-ink-700 max-w-2xl mx-auto">
              Simulate how our server coordinates each safety barrier before reaching out to family.
            </p>
          </div>

          <EscalationSimulator />
        </div>
      </section>

      {/* The 6 Fail-Safe Gates */}
      <section className="border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Zero-Tolerance Gatekeeping
            </span>
            <h2 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
              The Six Gates Every Notification Must Pass
            </h2>
            <p className="mt-3 text-base text-ink-700">
              Unlike client-side phone timers that fail when an app is closed, CareCircle’s gates are evaluated directly
              in our secure cloud backend with instant synchronization.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gates.map((gate) => (
              <Card key={gate.number} as="div" className="h-full">
                <CardBody className="p-6">
                  <span className="text-3xl font-extrabold text-sage-300 tabular-nums">
                    {gate.number}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-ink-900">{gate.title}</h3>
                  <p className="mt-2 text-sm text-ink-700 leading-relaxed">{gate.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Audit Record of What It Decided */}
      <section className="border-b border-cream-300 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
                <Database className="size-3.5" aria-hidden="true" />
                Zero-Fabrication Data Standard
              </div>
              <h2 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">
                A skipped call is information, not a gap.
              </h2>
              <p className="mt-4 text-base text-ink-700 leading-relaxed">
                If an escalation call is withheld because the household is inside quiet hours or the caregiver was
                already notified, CareCircle records the deliberate omission and the exact gate that triggered it.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-ink-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-ok-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Append-Only Ledger:</strong> Every notification, answer, skip, or failure is logged to an
                    immutable, tamperproof verification record.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-ok-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Complete Context:</strong> If an elderly parent doesn’t answer, caregivers can review whether
                    push alerts were received or if phone network issues occurred.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-ok-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>No False Green Status:</strong> Nothing is reported as ok unless confirmed by timestamped
                    event data.
                  </span>
                </li>
              </ul>
            </div>

            {/* Visual Simulated Audit Terminal */}
            <div className="rounded-2xl border border-ink-900 bg-ink-900 p-5 text-cream-50 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-ink-700 pb-3 text-ink-400">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-danger-500" />
                  <span className="size-2 rounded-full bg-warn-500" />
                  <span className="size-2 rounded-full bg-ok-500" />
                  audit_ledger.log
                </span>
                <span>FAIL_CLOSED = ACTIVE</span>
              </div>
              <div className="mt-4 space-y-2 text-ink-200">
                <p>
                  <span className="text-teal-400">[09:30:00Z]</span> DOSE_SCHEDULED id=8429 senior_id=31
                </p>
                <p>
                  <span className="text-teal-400">[09:45:00Z]</span> GATE_EVALUATE: overdue=true quiet_hours=false
                  budget=ok
                </p>
                <p>
                  <span className="text-teal-400">[09:45:01Z]</span> DISPATCH_PUSH priority=high recipient_id=31
                </p>
                <p>
                  <span className="text-warn-400">[10:00:00Z]</span> PUSH_UNACKNOWLEDGED: initiating voice gate
                </p>
                <p>
                  <span className="text-ok-400">[10:00:04Z]</span> VOICE_CALL_CONNECTED: dtmf_waiting
                </p>
                <p className="text-teal-300 font-bold">
                  <span className="text-teal-400">[10:00:19Z]</span> DOSE_CONFIRMED dtmf=1 by senior_id=31
                </p>
                <p className="text-ink-400">
                  <span className="text-teal-400">[10:00:20Z]</span> ESCALATION_STANDBY: circle notified of adherence
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-sage-800 text-cream-50 py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to protect your loved ones with calm vigilance?</h2>
          <p className="mt-4 text-lg text-sage-200">
            Set up your family care circle in under two minutes. No credit card required.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Create a Care Circle Now
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
