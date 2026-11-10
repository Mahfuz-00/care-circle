import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Eye,
  Type,
  Maximize2,
  Volume2,
  CheckCircle2,
  Sliders,
  Check
} from 'lucide-react'

import { MarketingLayout } from './components/MarketingLayout'
import { AmbientBackground } from './components/AmbientBackground'
import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody } from '../../components/ui/Card'

const FONT_SCALES = [1, 1.5, 2, 3] as const
type FontScale = (typeof FONT_SCALES)[number]

export function AccessibilityPage() {
  const [fontScale, setFontScale] = useState<FontScale>(1.5)
  const [highContrast, setHighContrast] = useState(false)

  const a11yPrinciples = [
    {
      icon: Type,
      title: 'Large Text is the Default, Not an Afterthought',
      description:
        'The dashboard sets a 17px root baseline. The mobile app uses 20sp body text and supports dynamic OS text scaling up to 3× without layout breaks.',
    },
    {
      icon: Eye,
      title: 'WCAG AAA Contrast Standard',
      description:
        'Warm Sage tokens are measured rigorously: body text exceeds 7:1 against cream, interactive elements exceed 4.5:1, and a dedicated High-Contrast mode achieves AAA across all surfaces.',
    },
    {
      icon: Maximize2,
      title: '48dp+ Minimum Touch Targets',
      description:
        'Nothing is too small to tap. Interactive elements have generous padding, and the mobile Emergency Lifeline button is guaranteed at least 96dp tall.',
    },
    {
      icon: CheckCircle2,
      title: 'Medication Names Never Truncate',
      description:
        'A truncated pill name (e.g., "Metformin Hydro..." vs "Metformin Extended-Release") is a life-safety hazard. CareCircle wraps all medical names completely.',
    },
    {
      icon: Volume2,
      title: 'Screen Reader First & Semantic Landmarks',
      description:
        'Loading skeletons are marked aria-hidden while a single verbal announcement ("Loading medications...") is read. Semantic skip links and landmarks guide keyboard users.',
    },
    {
      icon: Sliders,
      title: 'Prefers-Reduced-Motion Respected Globally',
      description:
        'Every animation and transition honors system motion preferences, collapsing to zero duration for vestibular-sensitive users.',
    },
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <AmbientBackground />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            <Eye className="size-3.5 text-teal-700" aria-hidden="true" />
            Universal Inclusive Design
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Built for the person <br />
            <span className="text-teal-700">holding the pill bottle.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700 leading-relaxed">
            The senior app is the primary interface of this company, not an afterthought. A senior taking morning
            medication may have low vision, trembling hands, or no reading glasses nearby. Every design decision in
            CareCircle is made under that pressure.
          </p>
        </div>
      </section>

      {/* Interactive Accessibility Tester Widget */}
      <section className="border-b border-cream-300 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-cream-300 bg-cream-100 p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Interactive Ergonomics Demo
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-ink-900">
                  Test Text Scaling & Contrast
                </h2>
                <p className="mt-1 text-sm text-ink-700">
                  See how CareCircle adapts seamlessly to high contrast and up to 3× OS font scaling.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-xl bg-cream-50 p-1 border border-cream-200 text-xs font-semibold">
                  <span className="px-2 text-ink-500">Scale:</span>
                  {FONT_SCALES.map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFontScale(scale)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        fontScale === scale
                          ? 'bg-sage-700 text-cream-50 font-bold'
                          : 'hover:bg-cream-200 text-ink-700'
                      }`}
                    >
                      {scale}×
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                    highContrast
                      ? 'bg-ink-900 text-cream-50 border-ink-900'
                      : 'bg-cream-50 text-ink-900 border-cream-300 hover:bg-cream-200'
                  }`}
                >
                  <Eye className="size-3.5" />
                  {highContrast ? 'High Contrast ON' : 'Standard Contrast'}
                </button>
              </div>
            </div>

            {/* Simulated Live Preview Card */}
            <div
              className={`mt-8 rounded-2xl border-2 p-6 sm:p-8 transition-all ${
                highContrast
                  ? 'border-black bg-white text-black shadow-lg'
                  : 'border-cream-300 bg-cream-50 text-ink-900 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
                    highContrast
                      ? 'bg-black text-white text-xs'
                      : 'bg-sage-100 text-sage-800 text-xs'
                  }`}
                >
                  Scheduled for 9:00 AM
                </span>
                <span className="text-xs font-semibold text-ink-500">12 tablets remaining</span>
              </div>

              <div className="mt-4">
                <h3
                  className="font-extrabold tracking-tight leading-tight transition-all"
                  style={{ fontSize: `${1.25 * fontScale}rem` }}
                >
                  Levothyroxine Sodium
                </h3>
                <p
                  className="mt-1 font-semibold text-ink-700 transition-all"
                  style={{ fontSize: `${0.95 * fontScale}rem` }}
                >
                  50 mcg · Take 1 tablet on an empty stomach with a full glass of water
                </p>
                <p
                  className="mt-2 text-ink-500 transition-all"
                  style={{ fontSize: `${0.8 * fontScale}rem` }}
                >
                  Notice how this long medication name never cuts off with "..." or breaks across columns.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-cream-200 flex flex-wrap gap-4 items-center justify-between">
                <button
                  type="button"
                  className={`rounded-2xl px-8 py-4 font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                    highContrast
                      ? 'bg-black text-white hover:bg-neutral-800'
                      : 'bg-sage-700 text-cream-50 hover:bg-sage-800'
                  }`}
                  style={{ minHeight: '56px', fontSize: `${1 * fontScale}rem` }}
                >
                  <Check className="size-6 stroke-[3]" />
                  I Took My Dose
                </button>

                <div className="text-xs font-mono text-ink-500">
                  Target size: &gt;56dp · Ratio: {highContrast ? '14.8:1 (AAA)' : '8.2:1 (AAA)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Principles Grid */}
      <section className="border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-ink-900 sm:text-4xl">
              The Six Tenets of CareCircle Accessibility
            </h2>
            <p className="mt-3 text-base text-ink-700">
              Accessibility is not a toggle hidden in submenus; it is the fundamental fabric of our design doctrine.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {a11yPrinciples.map((principle) => {
              const Icon = principle.icon
              return (
                <Card key={principle.title} as="div" className="h-full">
                  <CardBody className="p-6">
                    <div className="grid size-12 place-items-center rounded-2xl bg-sage-200/80 text-sage-800 mb-4">
                      <Icon className="size-6 text-teal-700" />
                    </div>
                    <h3 className="text-lg font-bold text-ink-900">{principle.title}</h3>
                    <p className="mt-2 text-sm text-ink-700 leading-relaxed">{principle.description}</p>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage-800 text-cream-50 py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Design that treats your family with dignity.</h2>
          <p className="mt-4 text-lg text-sage-200">
            See why seniors and caregivers enjoy using CareCircle every day.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Create a Senior-Friendly Circle
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
