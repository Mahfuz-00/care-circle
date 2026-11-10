import { useState } from 'react'
import {
  Tag,
  Plus,
  Megaphone,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  MousePointer,
  X,
} from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { LoadingState } from '../../components/ui/states'
import { formatCurrency } from '../../lib/format'
import {
  useCreateAnnouncement,
  useCreatePromotion,
  useMarketingAnnouncements,
  useMarketingLeads,
  useMarketingOverview,
  useMarketingPromotions,
  useToggleAnnouncement,
  useTogglePromotion,
  useUpdateLeadStatus,
} from './hooks'

export function PlatformMarketingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'promotions' | 'announcements' | 'leads'>('overview')

  // Data queries
  const { data: overview } = useMarketingOverview()
  const { data: promotions, isPending: isPromosPending } = useMarketingPromotions()
  const { data: announcements, isPending: isAnnouncementsPending } = useMarketingAnnouncements()
  const { data: leads, isPending: isLeadsPending } = useMarketingLeads()

  // Mutations
  const createPromoMutation = useCreatePromotion()
  const togglePromoMutation = useTogglePromotion()
  const createAnnouncementMutation = useCreateAnnouncement()
  const toggleAnnouncementMutation = useToggleAnnouncement()
  const updateLeadMutation = useUpdateLeadStatus()

  // New Promo Modal state
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoName, setPromoName] = useState('')
  const [promoDiscountType, setPromoDiscountType] = useState<'percent' | 'fixed_cents'>('percent')
  const [promoDiscountValue, setPromoDiscountValue] = useState(20)
  const [promoMaxRedemptions, setPromoMaxRedemptions] = useState('')

  // New Announcement Modal state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [annTitle, setAnnTitle] = useState('')
  const [annMessage, setAnnMessage] = useState('')
  const [annLinkUrl, setAnnLinkUrl] = useState('')
  const [annBadge, setAnnBadge] = useState('New')
  const [annTheme, setAnnTheme] = useState<'emerald' | 'amber' | 'rose' | 'sky' | 'indigo'>('emerald')

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode || !promoName) return
    try {
      await createPromoMutation.mutateAsync({
        code: promoCode.trim().toUpperCase(),
        name: promoName.trim(),
        discount_type: promoDiscountType,
        discount_value: Number(promoDiscountValue),
        max_redemptions: promoMaxRedemptions ? Number(promoMaxRedemptions) : null,
        is_active: true,
      })
      setShowPromoModal(false)
      setPromoCode('')
      setPromoName('')
    } catch (err) {
      alert('Failed to create promotion: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!annTitle || !annMessage) return
    try {
      await createAnnouncementMutation.mutateAsync({
        title: annTitle.trim(),
        message: annMessage.trim(),
        link_url: annLinkUrl.trim() || null,
        badge_text: annBadge.trim() || null,
        theme: annTheme,
        is_active: true,
      })
      setShowAnnouncementModal(false)
      setAnnTitle('')
      setAnnMessage('')
      setAnnLinkUrl('')
    } catch (err) {
      alert('Failed to create announcement: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleLeadStatusChange = async (leadId: number, status: string) => {
    await updateLeadMutation.mutateAsync({ id: leadId, status })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-4">
        <PageHeader
          title="Growth & Marketing Operations"
          description="Campaign performance, seasonal promotion codes, in-app notification banners, and B2B clinic leads."
        />

        <div className="flex rounded-xl bg-cream-200/80 p-1 text-xs font-bold text-ink-700">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('promotions')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'promotions' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
            }`}
          >
            Promo Codes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'announcements' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
            }`}
          >
            In-App Banners
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'leads' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
            }`}
          >
            Inbound Leads ({leads?.length ?? 0})
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Inbound Leads</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {overview?.total_leads ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-teal-700">
                  {overview?.lead_conversion_rate ?? 0}% conversion rate
                </p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <Briefcase className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Active Coupons</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {overview?.active_promotions ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-teal-700">
                  {overview?.total_redemptions ?? 0} total redemptions
                </p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-sage-100 text-sage-800">
                <Tag className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Banner Reach</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {overview?.total_impressions ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {overview?.active_announcements ?? 0} active notices
                </p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-cream-200 text-ink-800">
                <Megaphone className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Banner CTR</p>
                <p className="mt-1 text-2xl font-extrabold text-teal-900 font-mono">
                  {overview?.banner_ctr_percent ?? 0}%
                </p>
                <p className="mt-0.5 text-xs text-teal-700">
                  {overview?.total_clicks ?? 0} total interactions
                </p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <MousePointer className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-cream-200">
              <h3 className="font-bold text-ink-900 text-sm">Key Acquisition Channels</h3>
            </CardHeader>
            <CardBody className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-cream-50 border border-cream-200">
                <div>
                  <p className="font-bold text-ink-900">Hospital Discharge & Geriatrician Referral</p>
                  <p className="text-ink-500 text-[11px]">Direct physician prescribing portal</p>
                </div>
                <Badge tone="teal">6.6% Conv</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-cream-50 border border-cream-200">
                <div>
                  <p className="font-bold text-ink-900">Family Caregiver Peer Invites</p>
                  <p className="text-ink-500 text-[11px]">Zero-nagging viral word of mouth</p>
                </div>
                <Badge tone="teal">5.0% Conv</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-cream-50 border border-cream-200">
                <div>
                  <p className="font-bold text-ink-900">AARP & Senior Care Associations</p>
                  <p className="text-ink-500 text-[11px]">National elder care partnership codes</p>
                </div>
                <Badge tone="teal">4.5% Conv</Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="px-5 py-4 border-b border-cream-200">
              <h3 className="font-bold text-ink-900 text-sm">Campaign Funnel Diagnostics</h3>
            </CardHeader>
            <CardBody className="p-5 space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Prospect Inquiries</span>
                  <span className="font-mono">{overview?.total_leads ?? 0}</span>
                </div>
                <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Converted Households</span>
                  <span className="font-mono">{overview?.converted_leads ?? 0}</span>
                </div>
                <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                  <div
                    className="h-full bg-teal-700 rounded-full"
                    style={{ width: `${overview?.lead_conversion_rate ?? 0}%` }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 2: PROMO CODES */}
      {activeTab === 'promotions' && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-ink-900 text-sm">Active Promotion Codes & Coupons</h3>
              <p className="text-[11px] text-ink-500">Manage discounts for caregiver onboarding campaigns</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowPromoModal(true)}
            >
              <Plus className="size-4" />
              <span>Create Coupon</span>
            </Button>
          </CardHeader>

          <CardBody className="p-0">
            {isPromosPending ? (
              <div className="py-12">
                <LoadingState label="Loading promotions..." />
              </div>
            ) : !promotions || promotions.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-500">
                No active promotional codes defined.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100/70 border-b border-cream-200 text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    <tr>
                      <th className="px-5 py-3">Code / Title</th>
                      <th className="px-4 py-3">Discount</th>
                      <th className="px-4 py-3">Redemptions</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200 text-ink-800">
                    {promotions.map((p) => (
                      <tr key={p.id} className="hover:bg-cream-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono font-bold text-ink-950 block text-sm">
                            {p.code}
                          </span>
                          <span className="text-[11px] text-ink-500">{p.name}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-ink-900">
                          {p.discount_type === 'percent'
                            ? `${p.discount_value}% Off`
                            : `${formatCurrency(p.discount_value / 100)} Off`}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-ink-900">
                          {p.redeemed_count}
                          {p.max_redemptions ? ` / ${p.max_redemptions}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={p.is_active ? 'teal' : 'neutral'}>
                            {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => togglePromoMutation.mutate(p.id)}
                            className="text-xs font-bold text-ink-700"
                          >
                            {p.is_active ? (
                              <ToggleRight className="size-6 text-teal-600 inline" />
                            ) : (
                              <ToggleLeft className="size-6 text-ink-400 inline" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB 3: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-ink-900 text-sm">In-App Announcement Banners</h3>
              <p className="text-[11px] text-ink-500">Broadcast important maintenance, features, or upgrades to dashboards</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAnnouncementModal(true)}
            >
              <Plus className="size-4" />
              <span>New Announcement</span>
            </Button>
          </CardHeader>

          <CardBody className="p-0">
            {isAnnouncementsPending ? (
              <div className="py-12">
                <LoadingState label="Loading announcements..." />
              </div>
            ) : !announcements || announcements.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-500">
                No active announcements published.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100/70 border-b border-cream-200 text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    <tr>
                      <th className="px-5 py-3">Title & Message</th>
                      <th className="px-4 py-3">Theme</th>
                      <th className="px-4 py-3">Impressions</th>
                      <th className="px-4 py-3">Clicks / CTR</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200 text-ink-800">
                    {announcements.map((a) => {
                      const ctr = a.impressions_count > 0 ? Math.round((a.clicks_count / a.impressions_count) * 100) : 0
                      return (
                        <tr key={a.id} className="hover:bg-cream-50/60 transition-colors">
                          <td className="px-5 py-3 max-w-sm">
                            <p className="font-bold text-ink-900">{a.title}</p>
                            <p className="text-[11px] text-ink-600 truncate mt-0.5">{a.message}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone="teal">{a.theme.toUpperCase()}</Badge>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-ink-900">
                            {a.impressions_count}
                          </td>
                          <td className="px-4 py-3 font-mono text-ink-900">
                            {a.clicks_count} ({ctr}%)
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone={a.is_active ? 'teal' : 'neutral'}>
                              {a.is_active ? 'ACTIVE' : 'OFF'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => toggleAnnouncementMutation.mutate(a.id)}
                              className="text-xs font-bold text-ink-700"
                            >
                              {a.is_active ? (
                                <ToggleRight className="size-6 text-teal-600 inline" />
                              ) : (
                                <ToggleLeft className="size-6 text-ink-400 inline" />
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB 4: LEADS */}
      {activeTab === 'leads' && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200">
            <h3 className="font-bold text-ink-900 text-sm">Prospective Clinic & B2B Leads</h3>
            <p className="text-[11px] text-ink-500">Inbound inquiries from healthcare providers, assisted living communities, and clinics</p>
          </CardHeader>

          <CardBody className="p-0">
            {isLeadsPending ? (
              <div className="py-12">
                <LoadingState label="Loading prospective leads..." />
              </div>
            ) : !leads || leads.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-500">
                No prospective leads on file.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100/70 border-b border-cream-200 text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    <tr>
                      <th className="px-5 py-3">Contact & Organization</th>
                      <th className="px-4 py-3">Estimated Seniors</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Change Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200 text-ink-800">
                    {leads.map((l) => (
                      <tr key={l.id} className="hover:bg-cream-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-bold text-ink-900">{l.name}</p>
                          <p className="text-[11px] text-ink-500 font-mono">{l.email} · {l.phone || 'No phone'}</p>
                          {l.organization && (
                            <p className="text-[11px] font-semibold text-teal-800 mt-0.5">{l.organization}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-ink-900">
                          {l.estimated_seniors ? `${l.estimated_seniors} seniors` : '—'}
                        </td>
                        <td className="px-4 py-3 max-w-xs text-ink-600 text-[11px] line-clamp-2">
                          {l.notes || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            tone={
                              l.status === 'converted'
                                ? 'teal'
                                : l.status === 'demo_scheduled'
                                ? 'teal'
                                : l.status === 'contacted'
                                ? 'warn'
                                : l.status === 'lost'
                                ? 'danger'
                                : 'neutral'
                            }
                          >
                            {l.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <select
                            value={l.status}
                            onChange={(e) => handleLeadStatusChange(l.id, e.target.value)}
                            className="rounded-lg border border-cream-300 bg-white px-2 py-1 text-xs font-semibold text-ink-800"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="demo_scheduled">Demo Scheduled</option>
                            <option value="converted">Converted</option>
                            <option value="lost">Lost</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* NEW PROMO MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-bold text-ink-900 text-base">Create Promotional Code</h3>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="text-ink-400 hover:text-ink-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink-800 block mb-1">Coupon Code:</label>
                <input
                  type="text"
                  required
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. SPRINGCARE25"
                  className="w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Promotion Name:</label>
                <input
                  type="text"
                  required
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                  placeholder="e.g. Spring Seasonal Family Onboarding"
                  className="w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-800 block mb-1">Discount Type:</label>
                  <select
                    value={promoDiscountType}
                    onChange={(e) => setPromoDiscountType(e.target.value as 'percent' | 'fixed_cents')}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed_cents">Fixed Cents ($)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink-800 block mb-1">Discount Value:</label>
                  <input
                    type="number"
                    required
                    value={promoDiscountValue}
                    onChange={(e) => setPromoDiscountValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Max Redemptions (Optional):</label>
                <input
                  type="number"
                  value={promoMaxRedemptions}
                  onChange={(e) => setPromoMaxRedemptions(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-cream-200 pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={createPromoMutation.isPending}
                >
                  Create Code
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-bold text-ink-900 text-base">New In-App Announcement</h3>
              <button
                type="button"
                onClick={() => setShowAnnouncementModal(false)}
                className="text-ink-400 hover:text-ink-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink-800 block mb-1">Headline:</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. New Feature: Automated Voice Reminders"
                  className="w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Banner Message:</label>
                <textarea
                  required
                  rows={2}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Brief message displayed at the top of client dashboards..."
                  className="w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-800 block mb-1">Theme Color:</label>
                  <select
                    value={annTheme}
                    onChange={(e) => setAnnTheme(e.target.value as 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo')}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                  >
                    <option value="emerald">Emerald (Success)</option>
                    <option value="amber">Amber (Notice)</option>
                    <option value="sky">Sky (Informational)</option>
                    <option value="rose">Rose (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink-800 block mb-1">Badge Text:</label>
                  <input
                    type="text"
                    value={annBadge}
                    onChange={(e) => setAnnBadge(e.target.value)}
                    placeholder="e.g. Update"
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Optional Target Link URL:</label>
                <input
                  type="text"
                  value={annLinkUrl}
                  onChange={(e) => setAnnLinkUrl(e.target.value)}
                  placeholder="https://carecircle.app/..."
                  className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-cream-200 pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={createAnnouncementMutation.isPending}
                >
                  Publish Banner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
