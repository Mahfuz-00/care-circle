import { Link } from '@tanstack/react-router'
import {
  CreditCard,
  Wallet,
  Receipt,
  Mail,
  Bell,
  HeartPulse,
  Database,
  Flame,
  FileText,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'

import { PageHeader } from '../../components/ui/PageHeader'

const SETTINGS_SECTIONS = [
  {
    to: '/platform/plans',
    title: 'Plans & Pricing Catalogue',
    description: 'Define subscription tiers, medication caps, seats, and monthly rates synced with the public site.',
    icon: CreditCard,
    tone: 'teal',
  },
  {
    to: '/platform/billing',
    title: 'Invoices & Billing Ledger',
    description: 'Global financial transactions, cash queues, settlement reconciliation, and printable invoices.',
    icon: Receipt,
    tone: 'teal',
  },
  {
    to: '/platform/payment-gateways',
    title: 'Payment Gateways',
    description: 'Configure online and offline payment methods (Stripe, PayPal, Cash/Direct Bank transfer).',
    icon: Wallet,
    tone: 'sage',
  },
  {
    to: '/platform/refunds',
    title: 'Refunds & Refund Policy',
    description: 'Manage 30-day money-back guarantee, refund requests, and customer reimbursement ledger.',
    icon: Receipt,
    tone: 'teal',
  },
  {
    to: '/platform/feedback',
    title: 'Feedback & Bug Triage',
    description: 'Inbound client bug reports, device diagnostics, triage states, and resolution notes.',
    icon: MessageSquare,
    tone: 'sage',
  },
  {
    to: '/platform/email-settings',
    title: 'Email & SMTP Configuration',
    description: 'Manage outgoing transactional email delivery providers (Resend, SES, Mailgun, SMTP).',
    icon: Mail,
    tone: 'sage',
  },
  {
    to: '/platform/notifications',
    title: 'Notification Channels & System',
    description: 'Automated voice check-ins, Twilio SMS fallback, quiet-hours rules, and webhooks.',
    icon: Bell,
    tone: 'teal',
  },
  {
    to: '/platform/health',
    title: 'System Health & Telemetry',
    description: 'Uptime checks, PostgreSQL connection pools, cache latency, and service SLA monitors.',
    icon: HeartPulse,
    tone: 'sage',
  },
  {
    to: '/platform/backups',
    title: 'Backups & Disaster Recovery',
    description: 'Verified database snapshot archives, retention schedules, and restoration drill logs.',
    icon: Database,
    tone: 'teal',
  },
  {
    to: '/platform/failed-jobs',
    title: 'Failed Background Jobs',
    description: 'Dead-letter queues, missed webhook retries, and asynchronous dispatch error traces.',
    icon: Flame,
    tone: 'warn',
  },
  {
    to: '/platform/audit',
    title: 'Operator Audit Ledger',
    description: 'Append-only forensic log of all administrative read and mutation actions across the platform.',
    icon: FileText,
    tone: 'teal',
  },
]

export function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings & Infrastructure"
        description="Configure billing plans, merchant payment processors, communication gateways, and multi-tenant operational controls."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_SECTIONS.map((sec) => {
          const Icon = sec.icon
          return (
            <Link
              key={sec.to}
              to={sec.to}
              className="group block rounded-2xl border border-cream-300 bg-white p-5 shadow-xs transition-all hover:border-teal-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800 transition-transform group-hover:scale-105">
                  <Icon className="size-6" />
                </div>
                <ArrowRight className="size-4 text-ink-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h2 className="mt-4 text-base font-bold text-ink-900 group-hover:text-teal-800 transition-colors">
                {sec.title}
              </h2>
              <p className="mt-1 text-xs text-ink-500 line-clamp-2">
                {sec.description}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
