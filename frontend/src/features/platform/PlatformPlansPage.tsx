import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Plus,
  Check,
  Users,
  Pill,
  PhoneCall,
  ExternalLink,
  Trash2,
  Star,
  RotateCcw,
  Sparkles
} from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { TextField, SelectField, TextAreaField } from '../../components/ui/Field'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatNumber } from '../../lib/format'
import { usePlanStore, type PlanItem } from '../../stores/plans'

export function PlatformPlansPage() {
  const { plans, addPlan, deletePlan, togglePopular, resetToDefaults } = usePlanStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [priceMonthly, setPriceMonthly] = useState('29.00')
  const [priceAnnual, setPriceAnnual] = useState('290.00')
  const [seats, setSeats] = useState('8')
  const [medications, setMedications] = useState('20')
  const [voiceMinutes, setVoiceMinutes] = useState('120')
  const [trialDays, setTrialDays] = useState('30')
  const [isPopular, setIsPopular] = useState(false)
  const [featuresRaw, setFeaturesRaw] = useState(
    'Dedicated Priority Escalation, Advanced Burndown Alerts, Pharmacy Integration, Multi-Caregiver Sync',
  )
  const [notes, setNotes] = useState('Comprehensive family care coordination package.')

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    const featureList = featuresRaw
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)

    const newPlan: PlanItem = {
      code: code.trim().toLowerCase().replace(/\s+/g, '_'),
      name: name.trim(),
      price_monthly: parseFloat(priceMonthly) || 0,
      price_annual: parseFloat(priceAnnual) || 0,
      seats: seats === 'unlimited' ? null : parseInt(seats, 10),
      medications: medications === 'unlimited' ? null : parseInt(medications, 10),
      voice_minutes:
        voiceMinutes === 'push_only' ? 0 : voiceMinutes === 'unlimited' ? null : parseInt(voiceMinutes, 10),
      trial_days: parseInt(trialDays, 10) || 30,
      is_popular: isPopular,
      features:
        featureList.length > 0
          ? featureList
          : ['Custom Family Care Coordination', 'Bank-Grade Private Family Vault', 'Automated Verification'],
      notes: notes.trim() || 'Custom plan created by platform operator.',
      status: 'active',
    }

    addPlan(newPlan)
    setShowCreateModal(false)

    // Reset Form
    setName('')
    setCode('')
    setIsPopular(false)

    setStatusMessage(`Plan "${newPlan.name}" was published! It is now live on the public website (/pricing).`)
    setTimeout(() => setStatusMessage(null), 5000)
  }

  const handleDeletePlan = (planCode: string, planName: string) => {
    if (confirm(`Are you sure you want to remove the plan "${planName}"? It will be removed from the public website immediately.`)) {
      deletePlan(planCode)
      setStatusMessage(`Plan "${planName}" removed from catalogue.`)
      setTimeout(() => setStatusMessage(null), 4000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink-900">Platform Plan Catalogue & Billing</h2>
          <p className="text-sm text-ink-500">
            Create and edit subscription tiers. Any updates or additions here{' '}
            <strong className="text-teal-700">instantly reflect on the public website (/pricing and /)</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/pricing"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-cream-300 bg-cream-50 px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <ExternalLink className="size-3.5 text-teal-700" />
            View Live on Website
          </Link>

          <Button
            variant="secondary"
            size="sm"
            onClick={resetToDefaults}
            title="Reset to default plans"
          >
            <RotateCcw className="size-3.5" />
            Reset Defaults
          </Button>

          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="size-4" />
            Create New Plan
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-xl bg-ok-50 border border-ok-200 p-4 text-xs font-semibold text-ok-700 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="size-4 text-ok-600" />
            <span>{statusMessage}</span>
          </div>
          <Link to="/pricing" className="underline font-bold text-teal-800 hover:text-teal-900">
            Open /pricing to inspect
          </Link>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.code}
            as="div"
            className={`flex flex-col justify-between transition-all ${
              plan.is_popular ? 'ring-2 ring-teal-500 shadow-md' : 'shadow-2xs'
            }`}
          >
            <CardBody className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
                    {plan.is_popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">
                        <Sparkles className="size-3" /> Popular
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-ink-500">Code: {plan.code}</span>
                </div>
                <Badge tone="teal">Live on Website</Badge>
              </div>

              {/* Pricing Display */}
              <div className="rounded-xl bg-cream-100 p-3 border border-cream-200 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-ink-900 tabular-nums">
                    ${plan.price_monthly}
                  </span>
                  <span className="text-xs text-ink-500 font-semibold"> / month</span>
                </div>
                <div className="text-right text-xs text-ink-500">
                  <span className="font-bold text-teal-700 tabular-nums">${plan.price_annual}</span> / year
                  <span className="block text-[10px] text-ink-400">({plan.trial_days}-day guarantee)</span>
                </div>
              </div>

              {/* Limit Quotas */}
              <div className="space-y-2 pt-2 border-t border-cream-200 text-xs text-ink-700">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-ink-500">
                    <Users className="size-3.5 text-teal-700" /> Circle Seats:
                  </span>
                  <span className="font-bold tabular-nums">
                    {plan.seats === null ? 'Unlimited' : `${formatNumber(plan.seats)} members`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-ink-500">
                    <Pill className="size-3.5 text-teal-700" /> Medications:
                  </span>
                  <span className="font-bold tabular-nums">
                    {plan.medications === null ? 'Unlimited' : `${formatNumber(plan.medications)} tracked`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-ink-500">
                    <PhoneCall className="size-3.5 text-teal-700" /> Voice Minutes:
                  </span>
                  <span className="font-bold tabular-nums">
                    {plan.voice_minutes === null
                      ? 'Unlimited'
                      : plan.voice_minutes === 0
                      ? 'Push only'
                      : `${formatNumber(plan.voice_minutes)} min/mo`}
                  </span>
                </div>
              </div>

              {/* Features Count */}
              <div className="pt-2 text-xs">
                <span className="text-ink-500 font-semibold block mb-1">Active Features:</span>
                <ul className="space-y-1 text-[11px] text-ink-700">
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-1.5 truncate">
                      <Check className="size-3 text-ok-600 shrink-0" />
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-[10px] text-ink-400 font-bold">
                      +{plan.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => togglePopular(plan.code)}
                  className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                    plan.is_popular ? 'text-teal-700 hover:text-teal-800' : 'text-ink-500 hover:text-ink-900'
                  }`}
                  title="Toggle Popular Badge on marketing pricing table"
                >
                  <Star className={`size-3.5 ${plan.is_popular ? 'fill-teal-500 text-teal-600' : ''}`} />
                  {plan.is_popular ? 'Featured' : 'Make Featured'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeletePlan(plan.code, plan.name)}
                  className="flex items-center gap-1 text-danger-600 hover:text-danger-800 font-semibold cursor-pointer"
                  title="Remove plan from website"
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-cream-300 bg-cream-50 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-cream-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-ink-900">Create Platform Plan</h3>
                <p className="text-xs text-ink-500">
                  New plans are saved to storage and immediately reflect on the public pricing page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-ink-500 hover:text-ink-900 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-5 space-y-4 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  id="plan-name"
                  label="Plan Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!code) {
                      setCode(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_'))
                    }
                  }}
                  placeholder="e.g. Care Team Premier"
                  required
                />
                <TextField
                  id="plan-code"
                  label="Plan Code (Unique Slug)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. premier_tier"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  id="plan-price-monthly"
                  label="Monthly Price ($ USD)"
                  type="number"
                  step="0.01"
                  value={priceMonthly}
                  onChange={(e) => setPriceMonthly(e.target.value)}
                  required
                />
                <TextField
                  id="plan-price-annual"
                  label="Annual Price ($ USD)"
                  type="number"
                  step="0.01"
                  value={priceAnnual}
                  onChange={(e) => setPriceAnnual(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <SelectField
                  id="plan-seats"
                  label="Seat Limit"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  options={[
                    { value: '2', label: '2 Seats' },
                    { value: '5', label: '5 Seats' },
                    { value: '8', label: '8 Seats' },
                    { value: '15', label: '15 Seats' },
                    { value: 'unlimited', label: 'Unlimited' },
                  ]}
                />
                <SelectField
                  id="plan-meds"
                  label="Medications"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  options={[
                    { value: '5', label: '5 Meds' },
                    { value: '15', label: '15 Meds' },
                    { value: '25', label: '25 Meds' },
                    { value: 'unlimited', label: 'Unlimited' },
                  ]}
                />
                <SelectField
                  id="plan-voice"
                  label="Voice Minutes"
                  value={voiceMinutes}
                  onChange={(e) => setVoiceMinutes(e.target.value)}
                  options={[
                    { value: 'push_only', label: 'Push Only' },
                    { value: '60', label: '60 min/mo' },
                    { value: '120', label: '120 min/mo' },
                    { value: '180', label: '180 min/mo' },
                    { value: 'unlimited', label: 'Unlimited' },
                  ]}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  id="plan-trial"
                  label="Guarantee / Trial Period"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  options={[
                    { value: '14', label: '14-Day Free Trial' },
                    { value: '30', label: '30-Day Money-Back Guarantee' },
                    { value: '60', label: '60-Day Pilot Guarantee' },
                  ]}
                />
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 font-bold text-ink-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="size-4 rounded accent-teal-600"
                    />
                    Highlight as "Most Popular"
                  </label>
                </div>
              </div>

              <TextField
                id="plan-features"
                label="Included Features (Comma-Separated)"
                value={featuresRaw}
                onChange={(e) => setFeaturesRaw(e.target.value)}
                placeholder="Feature 1, Feature 2, Feature 3..."
                required
              />

              <TextAreaField
                id="plan-notes"
                label="Plan Summary / Description"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Short description displayed on card..."
              />

              <div className="pt-4 border-t border-cream-200 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Publish Plan to Live Website
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
