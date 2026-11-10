import { useState } from 'react'

import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'

const COHORTS = [
  { cohort: 'Nov 2025', size: 142, m1: '100%', m3: '98.5%', m6: '97.2%', m12: '96.4%' },
  { cohort: 'Dec 2025', size: 168, m1: '100%', m3: '98.8%', m6: '97.6%', m12: '96.8%' },
  { cohort: 'Jan 2026', size: 195, m1: '100%', m3: '99.0%', m6: '98.1%', m12: '—' },
  { cohort: 'Feb 2026', size: 210, m1: '100%', m3: '99.2%', m6: '—', m12: '—' },
  { cohort: 'Mar 2026', size: 240, m1: '100%', m3: '—', m6: '—', m12: '—' },
]

const ADHERENCE_DEMOGRAPHICS = [
  { bracket: 'Seniors 65–74 yrs', adherence: 96.2, circles: 512, voicePickup: 98.4 },
  { bracket: 'Seniors 75–84 yrs', adherence: 94.8, circles: 624, voicePickup: 97.6 },
  { bracket: 'Seniors 85+ yrs', adherence: 92.1, circles: 292, voicePickup: 99.1 },
]

export function PlatformAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'business' | 'service'>('business')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Analysis & Intelligence"
          description="In-depth telemetry across SaaS financial economics, subscriber cohort retention, clinical adherence, and escalation delivery SLAs."
        />
        <div className="inline-flex rounded-xl border border-cream-300 bg-white p-1 shadow-2xs self-start">
          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'business'
                ? 'bg-teal-700 text-cream-50'
                : 'text-ink-600 hover:text-ink-950'
            }`}
          >
            Business & Financials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('service')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'service'
                ? 'bg-teal-700 text-cream-50'
                : 'text-ink-600 hover:text-ink-950'
            }`}
          >
            Service & Clinical Health
          </button>
        </div>
      </div>

      {activeTab === 'business' ? (
        <div className="space-y-6">
          {/* FINANCIAL SUMMARY TILES */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardBody className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Gross MRR Movement</p>
                <p className="mt-1 text-2xl font-extrabold text-teal-800 font-mono">+$7,240</p>
                <p className="mt-0.5 text-xs text-ink-500">Net expansion this month</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Customer Lifetime Value</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">$1,635</p>
                <p className="mt-0.5 text-xs text-teal-700 font-semibold">42.4x LTV:CAC ratio</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Net Revenue Retention</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">108.4%</p>
                <p className="mt-0.5 text-xs text-teal-700 font-semibold">Healthy expansion tiering</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Annual Run Rate (ARR)</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">$583,800</p>
                <p className="mt-0.5 text-xs text-ink-500">Contracted annualized value</p>
              </CardBody>
            </Card>
          </div>

          {/* MRR WATERFALL BREAKDOWN */}
          <Card>
            <CardHeader className="border-b border-cream-300 px-5 py-4">
              <h2 className="text-base font-bold text-ink-900">Monthly Revenue Waterfall (Current Month)</h2>
            </CardHeader>
            <CardBody className="p-5">
              <div className="grid gap-3 sm:grid-cols-5 text-center">
                <div className="rounded-xl border border-cream-200 bg-cream-50 p-4">
                  <p className="text-xs font-bold text-ink-500 uppercase">Starting MRR</p>
                  <p className="mt-1 text-xl font-bold font-mono text-ink-900">$41,410</p>
                </div>
                <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                  <p className="text-xs font-bold text-teal-800 uppercase">New Subscriptions</p>
                  <p className="mt-1 text-xl font-bold font-mono text-teal-900">+$6,200</p>
                </div>
                <div className="rounded-xl border border-sage-200 bg-sage-50 p-4">
                  <p className="text-xs font-bold text-sage-800 uppercase">Tier Expansions</p>
                  <p className="mt-1 text-xl font-bold font-mono text-sage-900">+$1,450</p>
                </div>
                <div className="rounded-xl border border-danger-200 bg-danger-50 p-4">
                  <p className="text-xs font-bold text-danger-700 uppercase">Churn & Cancellations</p>
                  <p className="mt-1 text-xl font-bold font-mono text-danger-800">-$410</p>
                </div>
                <div className="rounded-xl border border-teal-300 bg-teal-100 p-4">
                  <p className="text-xs font-bold text-teal-950 uppercase">Ending MRR</p>
                  <p className="mt-1 text-xl font-extrabold font-mono text-teal-950">$48,650</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* SUBSCRIBER COHORT RETENTION TABLE */}
          <Card>
            <CardHeader className="border-b border-cream-300 px-5 py-4">
              <h2 className="text-base font-bold text-ink-900">Household Cohort Retention Matrix</h2>
              <p className="text-xs text-ink-500">Percentage of care circles remaining active over calendar periods</p>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink-800">
                <thead className="bg-cream-100/70 border-b border-cream-300 text-xs font-bold uppercase text-ink-600">
                  <tr>
                    <th className="px-5 py-3">Cohort</th>
                    <th className="px-4 py-3">New Circles</th>
                    <th className="px-4 py-3 text-center">Month 1</th>
                    <th className="px-4 py-3 text-center">Month 3</th>
                    <th className="px-4 py-3 text-center">Month 6</th>
                    <th className="px-5 py-3 text-center">Month 12</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {COHORTS.map((c) => (
                    <tr key={c.cohort} className="hover:bg-cream-50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-ink-900">{c.cohort}</td>
                      <td className="px-4 py-3.5 font-mono text-ink-600">{c.size}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-teal-800 bg-teal-50/30">{c.m1}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-teal-800 bg-teal-50/40">{c.m3}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-teal-800 bg-teal-50/50">{c.m6}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-teal-800 bg-teal-50/60">{c.m12}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SERVICE HEALTH SLA TILES */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardBody className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Overall Platform Adherence</p>
                <p className="mt-1 text-2xl font-extrabold text-teal-800 font-mono">94.6%</p>
                <p className="mt-0.5 text-xs text-teal-700">24,180 scheduled doses verified</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Voice Check Delivery SLA</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">99.4%</p>
                <p className="mt-0.5 text-xs text-teal-700 font-semibold">Zero dropped calls reported</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Emergency Ack Latency</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">34s</p>
                <p className="mt-0.5 text-xs text-teal-700 font-semibold">Target SLA &lt; 120 seconds</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Refill Automation Success</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">96.8%</p>
                <p className="mt-0.5 text-xs text-ink-500">Refills triggered before stock zero</p>
              </CardBody>
            </Card>
          </div>

          {/* ADHERENCE BY SENIOR DEMOGRAPHIC */}
          <Card>
            <CardHeader className="border-b border-cream-300 px-5 py-4">
              <h2 className="text-base font-bold text-ink-900">Medication Adherence by Age Bracket</h2>
              <p className="text-xs text-ink-500">Breakdown of on-time dose confirmations and voice check pickup rate</p>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink-800">
                <thead className="bg-cream-100/70 border-b border-cream-300 text-xs font-bold uppercase text-ink-600">
                  <tr>
                    <th className="px-5 py-3">Demographic Bracket</th>
                    <th className="px-4 py-3">Active Circles</th>
                    <th className="px-4 py-3">Med Adherence Rate</th>
                    <th className="px-5 py-3">Voice Pickup Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {ADHERENCE_DEMOGRAPHICS.map((d) => (
                    <tr key={d.bracket} className="hover:bg-cream-50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-ink-900">{d.bracket}</td>
                      <td className="px-4 py-3.5 font-mono text-ink-600">{d.circles}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-teal-800">{d.adherence}%</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-teal-900">{d.voicePickup}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
