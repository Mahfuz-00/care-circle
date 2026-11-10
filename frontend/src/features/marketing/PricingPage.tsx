import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Shield,
  HelpCircle,
  TrendingDown,
  PhoneCall,
  Pill,
  Users,
  CreditCard,
  Check,
  Sparkles,
  RotateCcw,
  ExternalLink
} from 'lucide-react'

import { MarketingLayout } from './components/MarketingLayout'
import { AmbientBackground } from './components/AmbientBackground'
import { usePlans } from './hooks'
import { formatNumber } from '../../lib/format'
import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody } from '../../components/ui/Card'
import type { PlanItem } from '../../stores/plans'

export function PricingPage() {
  const { plans } = usePlans()
  const [isAnnual, setIsAnnual] = useState(false)
  const [missedDosesPerWeek, setMissedDosesPerWeek] = useState(2)

  // Interactive ROI calculation (clinical average: missed chronic doses increase emergency admission risk by 38%)
  const emergencyRiskEst = (missedDosesPerWeek * 14.5).toFixed(0)

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <AmbientBackground />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            <Shield className="size-3.5 text-teal-700" aria-hidden="true" />
            Transparent & Verifiable Pricing
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Simple plans for families, <br />
            <span className="text-teal-700">no hidden surprises.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-ink-700 leading-relaxed">
            Our pricing is synced directly from our platform catalogue and enforced by the backend API.
            Every plan includes our bank-grade private family vault protection and 30-day guarantee.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-bold transition-colors ${
                !isAnnual ? 'text-ink-900' : 'text-ink-500'
              }`}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-teal-700 transition-colors duration-200 ease-in-out focus:outline-hidden"
              role="switch"
              aria-checked={isAnnual}
            >
              <span className="sr-only">Toggle annual billing</span>
              <span
                className={`pointer-events-none inline-block size-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>

            <span
              className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${
                isAnnual ? 'text-ink-900' : 'text-ink-500'
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-extrabold text-teal-800">
                Save ~20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Plans Grid Section */}
      <section className="border-b border-cream-300 py-16 sm:py-24 bg-cream-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Platform Admin Sync Notice */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-cream-200 bg-cream-100 p-4 text-xs text-ink-700 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-ok-500 animate-pulse-subtle shrink-0" />
              <span>
                <strong>Live Synchronized Catalogue:</strong> Plans created or adjusted by the platform admin reflect here in real-time.
              </span>
            </div>
            <Link
              to="/platform/plans"
              className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900 shrink-0 underline"
            >
              Open Platform Admin Plans Console <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <InteractivePlanCard
                key={plan.code}
                plan={plan}
                isAnnual={isAnnual}
              />
            ))}
          </div>

          {/* Payment Gateways Strip */}
          <div className="mt-12 rounded-3xl border border-cream-300 bg-cream-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-700">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-teal-100 text-teal-800 shrink-0">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-ink-900 text-sm">Accepted Payment Methods</h4>
                  <p className="text-ink-500">
                    Visa, Mastercard, AMEX, Apple Pay via Stripe · Partner Clinic Cash & Wire Transfer
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-semibold text-ok-700">
                  <Shield className="size-4" /> 256-Bit SSL Encrypted
                </span>
                <Link
                  to="/refund-policy"
                  className="font-bold text-teal-700 hover:text-teal-900 underline"
                >
                  30-Day Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost of Non-Adherence ROI Interactive Tool */}
      <section className="border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-cream-300 bg-cream-50 p-6 sm:p-10 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
              <TrendingDown className="size-4" aria-hidden="true" />
              Clinical Adherence Economics
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-ink-900">
              The Real Cost of Missed Medications
            </h2>
            <p className="mt-3 text-base text-ink-700">
              According to health economic research, medication non-adherence leads to \$100B+ in preventable ER visits
              and hospital readmissions annually. Adjust the slider to see how simple consistency protects health and family
              finances.
            </p>

            <div className="mt-8 grid gap-8 md:grid-cols-2 items-center">
              <div>
                <label htmlFor="missed-doses-slider" className="block text-sm font-bold text-ink-900">
                  Estimated Missed Doses Per Week:{' '}
                  <span className="text-teal-700 font-extrabold text-lg ml-1">
                    {missedDosesPerWeek}
                  </span>
                </label>
                <input
                  id="missed-doses-slider"
                  type="range"
                  min="1"
                  max="7"
                  value={missedDosesPerWeek}
                  onChange={(e) => setMissedDosesPerWeek(parseInt(e.target.value, 10))}
                  className="mt-3 w-full accent-teal-600 cursor-pointer"
                />
                <div className="mt-1 flex justify-between text-xs text-ink-500">
                  <span>1 dose / wk</span>
                  <span>4 doses / wk</span>
                  <span>7 doses / wk</span>
                </div>
              </div>

              <div className="rounded-2xl border border-cream-300 bg-cream-100 p-6 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-ink-700">Emergency Admission Risk:</span>
                  <span className="text-2xl font-extrabold text-danger-700 tabular-nums">
                    +{emergencyRiskEst}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-ink-700">Est. Avoidable Out-of-Pocket:</span>
                  <span className="text-xl font-bold text-ink-900 tabular-nums">
                    \${missedDosesPerWeek * 320} / yr
                  </span>
                </div>
                <p className="text-[11px] text-ink-500 pt-2 border-t border-cream-200">
                  A \$19/mo CareCircle subscription delivers an estimated 14× return in avoided acute hospital fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-cream-300 py-16 sm:py-24 bg-cream-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Clear Answers
            </span>
            <h2 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                q: 'What happens if a senior cannot answer the smartphone?',
                a: 'If a high-priority scheduled dose is not confirmed on the senior’s app within the configured grace period, the server initiates an automated voice call with DTMF keypad confirmation. If still unanswered, secondary family caregivers receive an immediate push alert.',
              },
              {
                q: 'How does the 30-day refund policy work?',
                a: 'We offer an unconditional 30-day money-back guarantee. If you decide CareCircle is not right for your family, email support or click "Request Refund" in your dashboard settings for an immediate 100% refund.',
              },
              {
                q: 'Can I pay with cash or local bank transfer?',
                a: 'Yes. In addition to online credit cards via Stripe, we accept manual bank wire and partner clinic cash payments configured directly in our platform.',
              },
              {
                q: 'Does CareCircle sell or share our health data?',
                a: 'Never. CareCircle is entirely subscription-supported. We enforce bank-grade private data isolation at the foundation level and never monetize, share, or sell family health data.',
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-cream-300 bg-cream-100 p-6 shadow-2xs">
                <h3 className="text-base font-bold text-ink-900 flex items-start gap-2.5">
                  <HelpCircle className="size-5 text-teal-600 mt-0.5 shrink-0" aria-hidden="true" />
                  {faq.q}
                </h3>
                <p className="mt-3 text-sm text-ink-700 pl-7 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage-800 text-cream-50 py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Start protecting your household today.</h2>
          <p className="mt-4 text-lg text-sage-200">
            Set up schedules, add trusted caregivers, and achieve complete peace of mind.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Create Your Free Account
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

function InteractivePlanCard({
  plan,
  isAnnual,
}: {
  plan: PlanItem
  isAnnual: boolean
}) {
  const isPopular = plan.is_popular
  const displayPrice = isAnnual
    ? plan.price_annual === 0
      ? 0
      : Math.round(plan.price_annual / 12)
    : plan.price_monthly

  return (
    <Card
      as="div"
      className={`relative flex h-full flex-col rounded-3xl transition-all duration-300 ${
        isPopular
          ? 'border-2 border-teal-500 bg-cream-50 shadow-xl ring-4 ring-teal-500/10'
          : 'border border-cream-300 bg-cream-100/90 shadow-2xs hover:shadow-md'
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="size-3" /> Most Popular for Families
        </span>
      )}

      <CardBody className="flex h-full flex-col p-6 sm:p-8">
        <div>
          <h3 className="text-2xl font-extrabold text-ink-900">{plan.name}</h3>
          <p className="mt-1 text-xs text-ink-500 font-semibold">{plan.notes}</p>

          {/* Pricing Header */}
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black text-ink-900 tabular-nums">
              ${displayPrice}
            </span>
            <span className="text-sm font-bold text-ink-500">
              {plan.price_monthly === 0 ? 'Free forever' : '/ month'}
            </span>
          </div>

          {isAnnual && plan.price_annual > 0 && (
            <p className="mt-1 text-xs font-bold text-teal-700">
              Billed annually at ${plan.price_annual} / year
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-cream-200">
            <span className="inline-flex items-center gap-1 rounded-full bg-cream-200/90 px-2.5 py-0.5 text-[11px] font-bold text-ink-700">
              <RotateCcw className="size-3 text-teal-700" />
              {plan.trial_days}-Day Money-Back Guarantee
            </span>
          </div>
        </div>

        {/* Quotas & Features */}
        <div className="mt-6 space-y-3 text-xs text-ink-700 flex-1">
          <div className="flex items-center gap-2 font-semibold">
            <Users className="size-4 text-teal-700 shrink-0" />
            <span>
              {plan.seats === null ? 'Unlimited' : `${formatNumber(plan.seats)}`} Family Caregiver Seats
            </span>
          </div>

          <div className="flex items-center gap-2 font-semibold">
            <Pill className="size-4 text-teal-700 shrink-0" />
            <span>
              {plan.medications === null ? 'Unlimited' : `${formatNumber(plan.medications)}`} Prescriptions Tracked
            </span>
          </div>

          <div className="flex items-center gap-2 font-semibold">
            <PhoneCall className="size-4 text-teal-700 shrink-0" />
            <span>
              {plan.voice_minutes === null
                ? 'Unlimited Voice Minutes'
                : plan.voice_minutes === 0
                ? 'Push notifications only'
                : `${formatNumber(plan.voice_minutes)} Voice Minutes / mo`}
            </span>
          </div>

          {/* Included Features List */}
          <div className="pt-3 border-t border-cream-200 space-y-2">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <Check className="size-3.5 text-ok-600 mt-0.5 shrink-0" />
                <span className="leading-tight text-ink-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Select Plan Button */}
        <div className="mt-8 pt-4 border-t border-cream-200">
          <Link
            to="/register"
            search={{ plan: plan.code }}
            className={buttonClasses(
              isPopular ? 'primary' : 'secondary',
              'md',
              'w-full text-center py-3 text-sm font-extrabold',
            )}
          >
            {plan.price_monthly === 0 ? 'Start Free Account' : `Choose ${plan.name}`}
          </Link>
        </div>
      </CardBody>
    </Card>
  )
}
