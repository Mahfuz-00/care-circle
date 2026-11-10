import { Link } from '@tanstack/react-router'
import {
  Lock,
  Database,
  FileCode2,
  KeyRound,
  FileCheck2,
  Server
} from 'lucide-react'

import { MarketingLayout } from './components/MarketingLayout'
import { AmbientBackground } from './components/AmbientBackground'
import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody } from '../../components/ui/Card'

export function SecurityPage() {
  const securityPillars = [
    {
      icon: Database,
      title: 'Bank-Grade Family Vault Isolation',
      subtitle: 'Complete privacy enforced at the database foundation, not in optional application code.',
      description:
        'Every single care-circle table enforces strict security constraints. If context is unset or invalid, the database returns exactly zero rows. The application fails closed—meaning your family data is physically inaccessible to anyone outside your private circle.',
      code: `ALTER TABLE medications ENABLE ROW LEVEL SECURITY;\nALTER TABLE medications FORCE ROW LEVEL SECURITY;\n\nCREATE POLICY medication_isolation_policy ON medications\n  USING (care_circle_id = current_setting('app.current_care_circle_id')::uuid);`,
    },
    {
      icon: KeyRound,
      title: 'Restricted Access Privileges',
      subtitle: 'The web application operates with minimal permissions to protect patient records.',
      description:
        'Our web servers run under strict, minimal security privileges: they can only access and record authorized prescription events for your active family circle, and can never alter fundamental database security rules.',
      code: `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES\n  TO carecircle_runtime;\n-- Schema alteration and DROP privileges are strictly revoked`,
    },
    {
      icon: FileCheck2,
      title: 'Immutable Append-Only Audit Ledger',
      subtitle: 'History cannot be rewritten, sanitized, or deleted.',
      description:
        'Every privileged action—including caregiver invites, medication dosage edits, dose confirmations, and escalation dispatches—is permanently appended to an immutable audit ledger with actor ID, care_circle_id, IP address, and raw payload.',
      code: `INSERT INTO audit_logs (id, care_circle_id, actor_id, ip_address, event, payload, created_at)\nVALUES (gen_random_uuid(), $1, $2, $3, 'dose.confirmed', $4, NOW());`,
    },
    {
      icon: Server,
      title: 'Measured Truth, Never Fabricated Health',
      subtitle: 'Data Integrity Standard: Nothing is reported that was not measured.',
      description:
        'If a scheduled backup verification fails because a dump tool is missing, the system reports skipped, never green. If a database ping fails, the health check reports fail. We never paint a dashboard green with placeholder data.',
      code: `// Health check contract:\nif (!isVerifiable(subsystem)) {\n  return HealthStatus::FAILED;\n}`,
    },
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <AmbientBackground />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            <Lock className="size-3.5 text-teal-700" aria-hidden="true" />
            Family Privacy & Data Vault
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Family privacy is an immutable rule, <br />
            <span className="text-teal-700">not a marketing promise.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700 leading-relaxed">
            In healthcare coordination, data privacy cannot rely on developer memory or casual software promises. CareCircle enforces bank-grade data isolation directly at the database foundation level: your family records are strictly quarantined, private, and inaccessible to any other user.
          </p>
        </div>
      </section>

      {/* Security Architecture Pillars */}
      <section className="border-b border-cream-300 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-16">
          {securityPillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="grid gap-8 lg:grid-cols-2 items-start"
              >
                <div>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-sage-100 p-2 text-sage-800 mb-4">
                    <Icon className="size-6 text-teal-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-ink-900">{pillar.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-teal-700">{pillar.subtitle}</p>
                  <p className="mt-4 text-base text-ink-700 leading-relaxed">{pillar.description}</p>
                </div>

                {/* Code / Verification Block */}
                <div className="rounded-2xl border border-ink-900 bg-ink-900 p-5 text-cream-50 font-mono text-xs shadow-lg">
                  <div className="flex items-center justify-between border-b border-ink-700 pb-2 mb-3 text-ink-400">
                    <span className="flex items-center gap-1.5">
                      <FileCode2 className="size-4 text-teal-400" />
                      Database Kernel Rule
                    </span>
                    <span className="text-ok-400">ENFORCED</span>
                  </div>
                  <pre className="overflow-x-auto text-ink-200 leading-relaxed">{pillar.code}</pre>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Surface Isolation & Sanctum Abilities (Rule #1) */}
      <section className="border-b border-cream-300 bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Architectural Standard
            </span>
            <h2 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
              Two Client Surfaces, Hard Token Isolation
            </h2>
            <p className="mt-3 text-base text-ink-700">
              Web dashboard and mobile apps communicate with the same backend, but tokens minted on one surface are
              instantly rejected by the other.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Card as="div" className="h-full">
              <CardBody className="p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-600">
                  Web Dashboard
                </span>
                <h3 className="mt-2 text-xl font-bold text-ink-900">/api/v1</h3>
                <p className="mt-3 text-sm text-ink-700 leading-relaxed">
                  Requires the <code className="font-mono text-xs bg-cream-200 px-1 py-0.5 rounded">dashboard</code> ability. Used by adult children and primary caregivers.
                </p>
              </CardBody>
            </Card>

            <Card as="div" className="h-full">
              <CardBody className="p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  Mobile App
                </span>
                <h3 className="mt-2 text-xl font-bold text-ink-900">/mobile/v1</h3>
                <p className="mt-3 text-sm text-ink-700 leading-relaxed">
                  Requires the <code className="font-mono text-xs bg-cream-200 px-1 py-0.5 rounded">mobile</code> ability. Optimized for seniors holding pill bottles.
                </p>
              </CardBody>
            </Card>

            <Card as="div" className="h-full">
              <CardBody className="p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-danger-600">
                  Landlord Console
                </span>
                <h3 className="mt-2 text-xl font-bold text-ink-900">/api/v1/platform</h3>
                <p className="mt-3 text-sm text-ink-700 leading-relaxed">
                  Requires both <code className="font-mono text-xs bg-cream-200 px-1 py-0.5 rounded">dashboard</code> and <code className="font-mono text-xs bg-cream-200 px-1 py-0.5 rounded">platform.admin</code>. Absent from mobile entirely.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage-800 text-cream-50 py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Trust starts with verifiable code.</h2>
          <p className="mt-4 text-lg text-sage-200">
            Learn why healthcare coordinators trust CareCircle’s strict isolation architecture.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Deploy a Secure Care Circle
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
