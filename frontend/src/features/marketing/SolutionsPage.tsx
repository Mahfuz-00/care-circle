import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Users,
  Heart,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

import { MarketingLayout } from './components/MarketingLayout'
import { AmbientBackground } from './components/AmbientBackground'
import { buttonClasses } from '../../components/ui/buttonStyles'

type PersonaId = 'caregiver' | 'senior' | 'self' | 'secondary'

interface PersonaItem {
  id: PersonaId
  name: string
  subtitle: string
  badge: string
  icon: typeof Users
  headline: string
  body: string
  benefits: string[]
  quote: string
  author: string
}

export function SolutionsPage() {
  const [activePersona, setActivePersona] = useState<PersonaId>('caregiver')

  const personas: PersonaItem[] = [
    {
      id: 'caregiver',
      name: 'Primary Caregiver',
      subtitle: 'For adult children balancing careers, kids, and aging parents.',
      badge: 'Visibility Without Nagging',
      icon: Users,
      headline: 'Know they took their pills today — without having to call and ask three times.',
      body: 'Caregiver guilt and anxiety are real. When you live in another town or work full-time, wondering if mom took her blood pressure medicine or if her pills ran out causes endless worry. CareCircle gives you silent remote confirmation when a dose is taken, and only notifies you when genuine intervention is required.',
      benefits: [
        'Real-time adherence timeline shows exact confirmation timestamps',
        'Burn-down stock tracking warns you to call the pharmacy before a bottle hits zero',
        'Multi-caregiver coordination ensures duties are shared across siblings',
        'Custom quiet hours prevent disturbance while parents are sleeping',
      ],
      quote:
        '“I used to call mom every morning just to check her pills, and she felt like I was babying her. Now, CareCircle lets her confirm with one tap, and I get peace of mind while she keeps her dignity.”',
      author: 'David K., Primary Caregiver for his 78-year-old mother',
    },
    {
      id: 'senior',
      name: 'Senior or Parent',
      subtitle: 'For older adults who want to live independently in their own homes.',
      badge: 'Dignity & Accessibility First',
      icon: Heart,
      headline: 'A simple screen that respects your eyesight, your time, and your independence.',
      body: 'Most modern apps are full of tiny text, confusing swipes, and ads. CareCircle is built strictly on human-centered ergonomics: massive 20sp body type that scales with your phone, 48dp+ buttons you can easily press without reading glasses, and high-contrast colors meeting WCAG AAA.',
      benefits: [
        'One single, massive "I took it" button — nothing to swipe or navigate',
        'Medication names are never cut off or truncated with ellipses',
        'Optional automated voice call reminder with telephone keypad confirmation',
        'Prominent, instant "I need help" emergency button always reachable',
      ],
      quote:
        '“I can actually read the name of my medicine without searching for my glasses. It doesn’t treat me like a child, it just keeps me on track.”',
      author: 'Eleanor P., age 82',
    },
    {
      id: 'self',
      name: 'Self-User',
      subtitle: 'For independent adults managing complex prescriptions or chronic conditions.',
      badge: 'Regimen Mastery',
      icon: UserCheck,
      headline: 'Manage complex schedules, food interactions, and pharmacy refills effortlessly.',
      body: 'Whether you are managing diabetes, thyroid therapy, organ transplant immunosuppressants, or cardiovascular health, staying on a multi-dose schedule requires discipline. CareCircle automates the mental overhead so you never double-dose or run dry.',
      benefits: [
        'Multi-frequency schedules (alternate days, with meals, specific weekdays)',
        'Automatic refill alerts days before your pill bottle is empty',
        'Doctor and lab appointment coordination with preparation reminders',
        'Adherence history and exportable records for your physician visits',
      ],
      quote:
        '“Managing four different prescriptions with different meal requirements was exhausting. CareCircle simplified my routine entirely.”',
      author: 'Marcus T., Self-User',
    },
    {
      id: 'secondary',
      name: 'Secondary Caregiver',
      subtitle: 'For siblings, neighbors, or home health aides providing backup support.',
      badge: 'Scoped Circle Backup',
      icon: ShieldAlert,
      headline: 'Step in when needed, without accidental interference or prescription confusion.',
      body: 'Not everyone in the care circle needs full administrative rights to edit medication dosages. Secondary caregivers get clear, scoped visibility and receive emergency escalation only when the primary caregiver is unavailable.',
      benefits: [
        'Role-based permissions prevent accidental schedule modifications',
        'Immediate notification if an emergency broadcast is triggered',
        'Visibility into appointment transport needs',
        'Server-enforced privacy: zero access to financial or unrelated personal details',
      ],
      quote:
        '“As the out-of-state sibling, I know everything is covered, but I am immediately alerted if my sister needs backup.”',
      author: 'Rachel M., Secondary Caregiver',
    },
  ]

  const active = personas.find((p) => p.id === activePersona) || personas[0]
  const ActiveIcon = active.icon

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <AmbientBackground />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-sage-200/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sage-900">
            <Users className="size-3.5 text-teal-700" aria-hidden="true" />
            Designed for Every Seat in the Circle
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            One care circle, <br />
            <span className="text-teal-700">the exact right view for each person.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700 leading-relaxed">
            CareCircle does not force an 80-year-old grandmother to decipher a complex analytics dashboard, and it doesn't
            restrict a busy caregiver to a tiny mobile screen. Every surface is tailored to who is using it and under
            what pressure.
          </p>
        </div>
      </section>

      {/* Interactive Persona Deep-Dive Tabs */}
      <section className="border-b border-cream-300 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Persona Selection Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-2xl bg-cream-200/60 p-1.5">
            {personas.map((persona) => {
              const Icon = persona.icon
              const isSelected = persona.id === activePersona
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => setActivePersona(persona.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl py-3 px-2 text-center transition-all ${
                    isSelected
                      ? 'bg-cream-50 text-sage-900 shadow-sm font-bold scale-101'
                      : 'text-ink-700 hover:text-ink-900 hover:bg-cream-100/60'
                  }`}
                >
                  <Icon className={`size-5 ${isSelected ? 'text-teal-700' : 'text-ink-500'}`} />
                  <span className="text-sm font-semibold">{persona.name}</span>
                </button>
              )
            })}
          </div>

          {/* Active Persona Spotlight Card */}
          <div className="mt-10 rounded-3xl border border-cream-300 bg-cream-100 p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
                  <ActiveIcon className="size-3.5" aria-hidden="true" />
                  {active.badge}
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-ink-900">
                  {active.headline}
                </h2>
                <p className="mt-1 text-sm text-ink-500">{active.subtitle}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-ink-900">The Problem & The CareCircle Solution</h3>
                <p className="mt-3 text-base text-ink-700 leading-relaxed">{active.body}</p>

                <div className="mt-6 rounded-2xl bg-cream-50 p-5 border border-cream-200 italic text-ink-700 text-sm">
                  {active.quote}
                  <p className="mt-2 text-xs font-bold text-sage-800 not-italic">— {active.author}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-ink-900">What You Get</h3>
                <ul className="mt-3 space-y-3">
                  {active.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm text-ink-700">
                      <CheckCircle2 className="size-5 text-teal-600 mt-0.5 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-cream-200">
                  <Link to="/register" className={buttonClasses('primary', 'md')}>
                    Start as {active.name} <ArrowRight className="size-4 ml-1.5 inline" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Hierarchy Matrix */}
      <section className="border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Clear Boundaries
            </span>
            <h2 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
              Roles Declared Once in System Configuration
            </h2>
            <p className="mt-3 text-base text-ink-700">
              Security rule #5: Roles are declared once in backend config; API enforcement and client permissions derive
              strictly from it.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-cream-300 bg-cream-50 shadow-sm">
            <table className="w-full text-left text-sm text-ink-700">
              <thead className="border-b border-cream-300 bg-cream-200/60 text-xs font-bold uppercase tracking-wider text-sage-900">
                <tr>
                  <th className="px-5 py-4">Capability</th>
                  <th className="px-4 py-4 text-center">Senior</th>
                  <th className="px-4 py-4 text-center">Primary Caregiver</th>
                  <th className="px-4 py-4 text-center">Secondary Caregiver</th>
                  <th className="px-4 py-4 text-center">Self-User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {[
                  ['One-tap dose confirmation', 'Yes', 'Yes (proxy)', 'No', 'Yes'],
                  ['Trigger emergency lifeline', 'Yes', 'Yes', 'Yes', 'Yes'],
                  ['Create & edit medication schedule', 'Optional', 'Yes', 'No', 'Yes'],
                  ['Manage circle members & invites', 'No', 'Yes', 'No', 'Yes'],
                  ['Receive overdue escalation calls', 'No', 'Yes (Primary)', 'Yes (Backup)', 'Emergency contacts'],
                  ['View full adherence & stock telemetry', 'Simplified', 'Yes', 'Scoped', 'Yes'],
                ].map(([cap, senior, primary, secondary, self]) => (
                  <tr key={cap} className="hover:bg-cream-100/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink-900">{cap}</td>
                    <td className="px-4 py-3.5 text-center">{senior}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-teal-700">{primary}</td>
                    <td className="px-4 py-3.5 text-center text-ink-500">{secondary}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-sage-700">{self}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage-800 text-cream-50 py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Bring your family into one calm circle.</h2>
          <p className="mt-4 text-lg text-sage-200">
            Invite your family members with clear roles and zero confusion.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Create Your Circle
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
