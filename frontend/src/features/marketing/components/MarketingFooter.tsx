import { Link } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
import { AppLogo } from '../../../components/ui/AppLogo'

export function MarketingFooter() {
  return (
    <footer className="border-t border-cream-300 bg-cream-100/90 text-ink-700">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <AppLogo size="lg" subtitle="Quiet Vigilance for Loved Ones" animated />
            </Link>
            <p className="max-w-sm text-sm text-ink-700 leading-relaxed">
              CareCircle coordinates medication schedules, stock forecasting, and non-aggressive escalation for seniors,
              families, and caregivers. Built on the Warm Sage design doctrine.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-sage-800">
              <span className="inline-flex size-2 rounded-full bg-ok-500 animate-pulse-subtle" />
              Operational status: All systems nominal · Bank-grade encryption active
            </div>
          </div>

          {/* Product Pillar Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sage-800">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm font-medium">
              <li>
                <Link to="/how-it-works" className="hover:text-sage-800 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-sage-800 transition-colors">
                  Core Features
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-sage-800 transition-colors">
                  Who It Is For
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-sage-800 transition-colors">
                  Plans & Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Ethics & Trust Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sage-800">Trust & Safety</h4>
            <ul className="mt-3 space-y-2 text-sm font-medium">
              <li>
                <Link to="/security" className="hover:text-sage-800 transition-colors">
                  Family Privacy & Security
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-sage-800 transition-colors">
                  WCAG AAA Accessibility
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-sage-800 transition-colors">
                  What We Don't Do
                </Link>
              </li>
              <li>
                <a
                  href="#emergency"
                  className="text-danger-700 hover:text-danger-800 font-semibold transition-colors"
                >
                  Emergency Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Console Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sage-800">Access</h4>
            <ul className="mt-3 space-y-2 text-sm font-medium">
              <li>
                <Link to="/login" className="hover:text-sage-800 transition-colors">
                  Caregiver Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-sage-800 transition-colors">
                  Create a Care Circle
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-sage-800 transition-colors">
                  Open Web Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Medical Notice */}
        <div id="emergency" className="mt-12 pt-8 border-t border-cream-200">
          <div className="rounded-2xl bg-cream-50 p-4 border border-cream-200 text-xs text-ink-700 space-y-2">
            <p className="font-bold text-ink-900 flex items-center gap-2">
              <Shield className="size-4 text-teal-700" aria-hidden="true" />
              Medical and Emergency Disclaimer
            </p>
            <p>
              CareCircle coordinates and reminds; it never diagnoses, prescribes, or provides medical advice. In the event
              of a sudden acute medical emergency (such as chest pains, severe fall, stroke symptoms, or severe shortness
              of breath), immediately contact your local emergency service (e.g. 911 / 112 / 999).
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500">
            <p>© {new Date().getFullYear()} CareCircle SaaS. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Light Navy Blue Architecture</span>
              <span>•</span>
              <span>Zero-Knowledge Tenant Isolation</span>
              <span>•</span>
              <span>Measured Clinical Truth</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
