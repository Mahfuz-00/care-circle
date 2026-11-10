import { Link } from '@tanstack/react-router'
import { RotateCcw, CheckCircle2, Clock, Mail } from 'lucide-react'

import { MarketingLayout } from './components/MarketingLayout'
import { AmbientBackground } from './components/AmbientBackground'
import { buttonClasses } from '../../components/ui/buttonStyles'

export function RefundPolicyPage() {
  const policies = [
    {
      title: '30-Day Unconditional Money-Back Guarantee',
      description:
        'If you or your family members feel that CareCircle does not provide complete peace of mind within the first 30 days of active service, you are entitled to a 100% full refund with zero questions asked.',
    },
    {
      title: 'Medical & Life Event Exception Clause',
      description:
        'If a senior patient is hospitalized, transitions to an assisted living facility with on-site staff, or experiences a change in medical care, any remaining pre-paid subscription period will be refunded on a pro-rata basis immediately.',
    },
    {
      title: 'Payment Method Refund Processing Times',
      description:
        'Online credit card refunds via Stripe reflect on your bank statement within 3 to 5 business days. Direct bank transfers process within 2 to 4 business days. Offline clinic cash payments are refunded via bank transfer or direct clinic voucher.',
    },
    {
      title: 'Pro-Rata Annual Plan Cancellations',
      description:
        'For subscribers on annual billing, cancellations requested after the initial 30-day guarantee period receive a pro-rated refund for all unused whole months remaining in the annual term.',
    },
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <AmbientBackground />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            <RotateCcw className="size-3.5 text-teal-700" aria-hidden="true" />
            Transparent Guarantee
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Our Care & Satisfaction <br />
            <span className="text-teal-700">Refund Policy.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700 leading-relaxed">
            Taking care of aging parents and managing prescriptions is stressful enough. We stand behind our
            software with clear, honest refund terms and a no-hassle guarantee.
          </p>
        </div>
      </section>

      {/* Main Policy Points */}
      <section className="border-b border-cream-300 py-16 sm:py-24 bg-cream-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          <div className="space-y-6">
            {policies.map((policy) => (
              <div
                key={policy.title}
                className="rounded-2xl border border-cream-300 bg-cream-100 p-6 sm:p-8 shadow-2xs"
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-10 place-items-center rounded-xl bg-teal-100 text-teal-800 shrink-0 mt-0.5">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink-900">{policy.title}</h2>
                    <p className="mt-2 text-base text-ink-700 leading-relaxed">{policy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How to Request a Refund Card */}
          <div className="rounded-3xl border border-cream-300 bg-cream-100 p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-ink-900">How to Request a Refund</h3>
            <p className="mt-2 text-sm text-ink-700 leading-relaxed">
              You can initiate a refund in under 60 seconds through either of these methods:
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sage-800">
                  <Clock className="size-4 text-teal-700" />
                  Method 1: Direct in Dashboard
                </span>
                <p className="mt-2 text-sm text-ink-700">
                  Navigate to <strong>Settings → Billing & Subscriptions</strong> and click{' '}
                  <span className="font-semibold text-ink-900">"Request Refund"</span>. The platform admin team will
                  process it immediately.
                </p>
              </div>

              <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sage-800">
                  <Mail className="size-4 text-teal-700" />
                  Method 2: Email Support
                </span>
                <p className="mt-2 text-sm text-ink-700">
                  Send an email to <span className="font-semibold text-teal-700">billing@carecircle.health</span> with
                  your Care Circle name. We reply and process within 24 business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage-800 text-cream-50 py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Try CareCircle with zero financial risk.</h2>
          <p className="mt-4 text-lg text-sage-200">
            Backed by our 30-day unconditional guarantee. No hidden catches.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Start 30-Day Risk-Free Trial
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
