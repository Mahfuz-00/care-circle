import { Link } from '@tanstack/react-router'
import {
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Eye,
  Lock,
  Heart,
  Pill,
  ChevronRight
} from 'lucide-react'

import { MarketingLayout } from './components/MarketingLayout'
import { AmbientBackground } from './components/AmbientBackground'
import { HeroMotionGraphic } from './components/HeroMotionGraphic'
import { AdherenceVisualizer } from './components/AdherenceVisualizer'
import { useSession } from '../auth/useSession'
import { usePlans } from './hooks'
import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody } from '../../components/ui/Card'
import { formatNumber } from '../../lib/format'

/**
 * Flagship Marketing Homepage (Route `/`).
 *
 * Implements the full Warm Sage design system, motion graphics demonstrations,
 * conversion-optimized pathways to dedicated section pages, and embedded
 * Schema.org JSON-LD for SEO / AEO.
 */
export function LandingPage() {
  const { isAuthenticated } = useSession()

  // SEO / AEO Structured Data (Schema.org)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'CareCircle',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web, iOS, Android',
        description:
          'Medication and care coordination SaaS for seniors, self-users, caregivers, and families. Features server-enforced escalation, stock burn-down forecasting, and bank-grade private family vault isolation.',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'MedicalWebPage',
        name: 'CareCircle Medication and Care Coordination',
        aspect: 'Overview',
        audience: {
          '@type': 'PeopleAudience',
          suggestedMinAge: '18',
        },
      },
    ],
  }

  return (
    <MarketingLayout>
      {/* Schema.org JSON-LD script for SEO & Answer Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Flagship Hero Section */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100 py-16 lg:py-24">
        <AmbientBackground />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-sage-200/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sage-900 border border-sage-300">
                <span className="size-2 rounded-full bg-teal-600 animate-pulse-subtle" />
                Quiet vigilance for the people you love
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-900 leading-[1.12]">
                No medication dose should be forgotten without a{' '}
                <span className="text-teal-700">clear, respectful attempt.</span>
              </h1>

              <p className="text-lg text-ink-700 leading-relaxed max-w-2xl">
                CareCircle keeps every prescription on a clear schedule, forecasts pill stock before bottles run dry,
                and uses a server-enforced escalation pipeline: gentle in-app prompts first, high-priority push second, a
                calm telephone voice check third, and family circle notification only when something is truly wrong.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap gap-3.5">
                {isAuthenticated ? (
                  <Link to="/dashboard" className={buttonClasses('primary', 'lg')}>
                    Open your dashboard <ArrowRight className="size-5 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className={buttonClasses('primary', 'lg')}>
                      Create a care circle <ArrowRight className="size-5 ml-2" />
                    </Link>
                    <Link to="/how-it-works" className={buttonClasses('secondary', 'lg')}>
                      How it works
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Metrics / Micro-proof */}
              <div className="pt-4 border-t border-cream-200 flex flex-wrap items-center gap-6 text-xs text-ink-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-ok-600" />
                  <span>Bank-Grade Private Family Vault</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-ok-600" />
                  <span>WCAG AAA Senior-First Design</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-ok-600" />
                  <span>Zero Medical Ads or Data Sales</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Motion Graphics Simulator */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <HeroMotionGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* TouchDine-Inspired Impact & Metrics Strip */}
      <section className="border-b border-cream-300 bg-cream-50 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-cream-200 bg-cream-100 p-5 text-center shadow-2xs">
              <span className="text-3xl font-extrabold text-sage-700 tabular-nums">99.8%</span>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-500">Dispatch Reliability</p>
              <p className="mt-0.5 text-xs text-ink-700">Multi-channel voice, push & SMS</p>
            </div>
            <div className="rounded-2xl border border-cream-200 bg-cream-100 p-5 text-center shadow-2xs">
              <span className="text-3xl font-extrabold text-teal-700 tabular-nums">0</span>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-500">Silent Outages</p>
              <p className="mt-0.5 text-xs text-ink-700">Burndown inventory forecasting</p>
            </div>
            <div className="rounded-2xl border border-cream-200 bg-cream-100 p-5 text-center shadow-2xs">
              <span className="text-3xl font-extrabold text-sage-700 tabular-nums">&lt; 45s</span>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-500">Lifeline Alert</p>
              <p className="mt-0.5 text-xs text-ink-700">Immediate family broadcast</p>
            </div>
            <div className="rounded-2xl border border-cream-200 bg-cream-100 p-5 text-center shadow-2xs">
              <span className="text-3xl font-extrabold text-teal-700 tabular-nums">100%</span>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-500">Complete Family Privacy</p>
              <p className="mt-0.5 text-xs text-ink-700">Private, isolated family circles</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Two Failures Section */}
      <section className="border-b border-cream-300 py-16 sm:py-20 bg-cream-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              The Root Problem
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-ink-900">
              Two failures dominate healthcare at home, <br />
              <span className="text-sage-700">and everything here is built around them.</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <Card as="div" className="h-full border-2 hover:border-cream-400 transition-all shadow-sm">
              <CardBody className="p-8 flex flex-col justify-between">
                <div>
                  <div className="grid size-12 place-items-center rounded-2xl bg-warn-100 text-warn-600 mb-4">
                    <Clock className="size-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-ink-900">1. The Forgotten Moment</h3>
                  <p className="mt-3 text-base text-ink-700 leading-relaxed">
                    A reminder that arrives at the wrong time, inside the wrong channel, or that demands an app be
                    manually unlocked and deciphered before it means anything is quickly swiped away, forgotten, or never
                    seen.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-cream-200">
                  <Link
                    to="/how-it-works"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800"
                  >
                    See our non-aggressive escalation engine <ChevronRight className="size-4" />
                  </Link>
                </div>
              </CardBody>
            </Card>

            <Card as="div" className="h-full border-2 hover:border-cream-400 transition-all shadow-sm">
              <CardBody className="p-8 flex flex-col justify-between">
                <div>
                  <div className="grid size-12 place-items-center rounded-2xl bg-danger-100 text-danger-600 mb-4">
                    <Pill className="size-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-ink-900">
                    2. The Invisible Stockout & Silent Emergency
                  </h3>
                  <p className="mt-3 text-base text-ink-700 leading-relaxed">
                    Nobody knows how many pills remain in the bottle until it is completely empty on a Sunday night.
                    Nobody knows an elderly parent fell or needs urgent help until agonizing hours have elapsed.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-cream-200">
                  <Link
                    to="/features"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800"
                  >
                    Explore stock forecasting & emergency lifeline <ChevronRight className="size-4" />
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Architecture Pillars & Adherence Preview */}
      <section className="border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Measured Clinical Truth
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink-900">
                Nothing is reported that was not measured.
              </h2>
              <p className="text-base text-ink-700 leading-relaxed">
                Our strict data integrity rule: We never fabricate statistics to make a chart look pretty. If a dose confirmation was
                unrecorded, it is reported as missing, never assumed taken. If a system check cannot run, it reports as
                failing.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-teal-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-ink-700">
                    <strong>State in words, not color:</strong> A status chip always displays its explicit textual label
                    so printing or visual impairment causes zero ambiguity.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-teal-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-ink-700">
                    <strong>Tabular figures for numbers:</strong> Numeric values render in aligned monospaced tabular
                    figures so stock decrements and timestamps are instantly scannable.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-teal-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-ink-700">
                    <strong>Immutable audit records:</strong> Every change, invite, or dose is backed by a permanent,
                    tamperproof verification record.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/security" className={buttonClasses('secondary', 'md')}>
                  Inspect our security & isolation architecture
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <AdherenceVisualizer />
            </div>
          </div>
        </div>
      </section>

      {/* Website Sections Directory: Each Section Has Its Own Page */}
      <section className="border-b border-cream-300 py-16 sm:py-24 bg-cream-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Complete Deep-Dive Directory
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-ink-900">
              Explore Every Pillar of the CareCircle Platform
            </h2>
            <p className="mt-3 text-base text-ink-700">
              Each section has its own dedicated page with comprehensive specifications, interactive tools, and design
              doctrines.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                to: '/how-it-works',
                title: 'How It Works',
                badge: 'Multi-Channel Pipeline',
                icon: Clock,
                desc: 'The server-enforced escalation cascade, quiet hours intelligence, and the 6 fail-safe gates.',
              },
              {
                to: '/features',
                title: 'Core Features',
                badge: 'Platform Capabilities',
                icon: Pill,
                desc: 'Medication management, stock burndown forecasting, doctor appointments, and pharmacy dialer.',
              },
              {
                to: '/solutions',
                title: 'Who It Is For',
                badge: '4 Dedicated Roles',
                icon: Users,
                desc: 'Tailored views and ergonomic standards for Seniors, Primary Caregivers, Backup Family, and Self-Users.',
              },
              {
                to: '/pricing',
                title: 'Plans & Pricing',
                badge: 'Live Catalogue',
                icon: Sparkles,
                desc: 'Transparent plans read straight from the live backend catalog, with an interactive adherence ROI tool.',
              },
              {
                to: '/security',
                title: 'Security & Privacy',
                badge: 'Bank-Grade Vault',
                icon: Lock,
                desc: '100% private family data isolation, least-privilege roles, and tamperproof verification history.',
              },
              {
                to: '/accessibility',
                title: 'Accessibility & A11y',
                badge: 'WCAG AAA Design',
                icon: Eye,
                desc: 'Large 20sp body type, up to 3× font scaling, 48dp+ tap targets, no text truncation, and high contrast.',
              },
              {
                to: '/safety',
                title: 'Deliberate Boundaries',
                badge: 'Safety Manifesto',
                icon: ShieldAlert,
                desc: 'What CareCircle deliberately does not do: no diagnosis, no algorithmic prescribing, and no data sales.',
              },
            ].map((section) => {
              const Icon = section.icon
              return (
                <Link
                  key={section.to}
                  to={section.to}
                  className="group rounded-2xl border border-cream-300 bg-cream-100 p-6 shadow-2xs hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="grid size-11 place-items-center rounded-xl bg-sage-200/90 text-sage-800 group-hover:bg-teal-100 group-hover:text-teal-800 transition-colors">
                        <Icon className="size-5" />
                      </div>
                      <span className="rounded-full bg-cream-50 px-2.5 py-0.5 text-2xs font-bold text-ink-500 border border-cream-200">
                        {section.badge}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-ink-900 group-hover:text-teal-800 transition-colors">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink-700 leading-relaxed">{section.desc}</p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-cream-200 flex items-center text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
                    Read dedicated section <ChevronRight className="size-4 ml-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Live Plans Snapshot Section */}
      <section className="border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Transparent Pricing
              </span>
              <h2 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
                Plans Read Straight from the API
              </h2>
              <p className="mt-2 text-base text-ink-700 max-w-xl">
                We do not advertise limits our software cannot enforce.
              </p>
            </div>
            <Link to="/pricing" className={buttonClasses('secondary', 'md')}>
              View full pricing & ROI calculator <ArrowRight className="size-4 ml-1.5 inline" />
            </Link>
          </div>

          <PlansPreview />
        </div>
      </section>

      {/* Final Conversion Banner */}
      <section className="bg-sage-800 text-cream-50 py-16 sm:py-24 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-sage-700 px-4 py-1 text-xs font-bold text-sage-100">
            <Heart className="size-4 text-teal-300" />
            Start with confidence
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Give your loved ones the quiet vigilance they deserve.
          </h2>
          <p className="text-lg text-sage-200 max-w-2xl mx-auto leading-relaxed">
            Create your family care circle in minutes. Add schedules, invite caregivers, and rest easy knowing a
            tamperproof, server-enforced safety net is watching over them.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Create Free Care Circle
            </Link>
            <Link to="/how-it-works" className={buttonClasses('secondary', 'lg')}>
              Learn how it works
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

function PlansPreview() {
  const { plans } = usePlans()

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.code}
          as="div"
          className={`flex h-full flex-col relative transition-all ${
            plan.is_popular
              ? 'border-2 border-teal-500 bg-cream-50 shadow-md ring-2 ring-teal-500/10'
              : 'border border-cream-300 bg-cream-100/90 shadow-2xs'
          }`}
        >
          {plan.is_popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3 py-0.5 text-[11px] font-extrabold text-white shadow-sm uppercase tracking-wider">
              Most Popular
            </span>
          )}
          <CardBody className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-ink-900">{plan.name}</h3>
                <span className="font-mono text-xs text-ink-400">/{plan.code}</span>
              </div>
              <p className="text-xs text-ink-500 mt-1">{plan.notes}</p>

              {/* Price Tag */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-ink-900 tabular-nums">
                  ${plan.price_monthly}
                </span>
                <span className="text-xs font-bold text-ink-500">
                  {plan.price_monthly === 0 ? 'Free tier' : '/ mo'}
                </span>
              </div>

              <dl className="mt-4 space-y-2 text-xs text-ink-700 pt-3 border-t border-cream-200">
                <div className="flex justify-between">
                  <dt className="text-ink-500 font-medium">Circle Seats:</dt>
                  <dd className="font-bold tabular-nums text-ink-900">
                    {plan.seats === null ? 'Unlimited' : `${formatNumber(plan.seats)} members`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500 font-medium">Medications:</dt>
                  <dd className="font-bold tabular-nums text-ink-900">
                    {plan.medications === null ? 'Unlimited' : `${formatNumber(plan.medications)} tracked`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500 font-medium">Voice Calls:</dt>
                  <dd className="font-bold tabular-nums text-ink-900">
                    {plan.voice_minutes === null
                      ? 'Unlimited'
                      : plan.voice_minutes === 0
                      ? 'Push only'
                      : `${formatNumber(plan.voice_minutes)} min / mo`}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 pt-4 border-t border-cream-200">
              <Link
                to="/pricing"
                className={buttonClasses(plan.is_popular ? 'primary' : 'secondary', 'md', 'w-full text-center')}
              >
                {plan.price_monthly === 0 ? 'Start Free Account' : `View ${plan.name} Details`}
              </Link>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
