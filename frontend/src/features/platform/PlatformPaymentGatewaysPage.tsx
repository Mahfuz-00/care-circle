import { useState } from 'react'
import {
  CreditCard,
  Banknote,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Zap,
  Building,
} from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { LoadingState } from '../../components/ui/states'
import type { PaymentGatewaySettings } from '../../lib/types'
import {
  usePaymentSettings,
  useTestPaymentGateway,
  useUpdatePaymentSettings,
} from './hooks'

export function PlatformPaymentGatewaysPage() {
  const { data: settings, isPending } = usePaymentSettings()

  if (isPending || !settings) {
    return (
      <div className="py-12">
        <LoadingState label="Loading payment gateway configurations..." />
      </div>
    )
  }

  return <PaymentGatewaysContent settings={settings} />
}

function PaymentGatewaysContent({ settings }: { settings: PaymentGatewaySettings }) {
  const updateSettingsMutation = useUpdatePaymentSettings()
  const testGatewayMutation = useTestPaymentGateway()

  // Form state
  const [activeGateway, setActiveGateway] = useState(settings.active_gateway || 'stripe')
  const [mode, setMode] = useState<'sandbox' | 'live'>(settings.mode || 'sandbox')
  const [currency, setCurrency] = useState(settings.currency || 'USD')
  const [autoBilling, setAutoBilling] = useState(settings.auto_billing_enabled ?? true)

  // Stripe state
  const [stripeEnabled, setStripeEnabled] = useState(settings.gateways?.stripe?.enabled ?? true)
  const [stripePublishableKey, setStripePublishableKey] = useState(settings.gateways?.stripe?.publishable_key || '')
  const [stripeSecretKey, setStripeSecretKey] = useState(settings.gateways?.stripe?.secret_key || '')
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState(settings.gateways?.stripe?.webhook_secret || '')

  // Bank transfer state
  const [bankEnabled, setBankEnabled] = useState(settings.gateways?.bank_transfer?.enabled ?? true)
  const [bankName, setBankName] = useState(settings.gateways?.bank_transfer?.bank_name || '')
  const [accountName, setAccountName] = useState(settings.gateways?.bank_transfer?.account_name || '')
  const [accountNumber, setAccountNumber] = useState(settings.gateways?.bank_transfer?.account_number || '')
  const [routingCode, setRoutingCode] = useState(settings.gateways?.bank_transfer?.routing_code || '')
  const [bankInstructions, setBankInstructions] = useState(settings.gateways?.bank_transfer?.instructions || '')

  // Cash state
  const [cashEnabled, setCashEnabled] = useState(settings.gateways?.cash?.enabled ?? true)
  const [cashInstructions, setCashInstructions] = useState(settings.gateways?.cash?.instructions || '')

  const [testResult, setTestResult] = useState<{
    status: string
    gateway: string
    latency_ms: number
    message: string
  } | null>(null)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettingsMutation.mutateAsync({
        active_gateway: activeGateway,
        mode,
        currency,
        auto_billing_enabled: autoBilling,
        gateways: {
          stripe: {
            enabled: stripeEnabled,
            sandbox: mode === 'sandbox',
            publishable_key: stripePublishableKey,
            secret_key: stripeSecretKey,
            webhook_secret: stripeWebhookSecret,
          },
          bank_transfer: {
            enabled: bankEnabled,
            bank_name: bankName,
            account_name: accountName,
            account_number: accountNumber,
            routing_code: routingCode,
            instructions: bankInstructions,
          },
          cash: {
            enabled: cashEnabled,
            instructions: cashInstructions,
          },
        },
      })
      setSavedNotice('Payment gateway settings successfully updated.')
      setTimeout(() => setSavedNotice(null), 4000)
    } catch (err) {
      alert('Failed to save settings: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleTestPing = async (gatewayName: string) => {
    setTestResult(null)
    try {
      const res = await testGatewayMutation.mutateAsync(gatewayName)
      setTestResult(res)
    } catch (err) {
      alert('Test failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Payment Gateways"
          description="Configure credit card processing, sandbox credentials, manual clinic settlements, and automated subscription billing."
        />

        <div className="flex items-center gap-2">
          <Badge tone={mode === 'live' ? 'teal' : 'warn'}>
            Mode: {mode.toUpperCase()}
          </Badge>
          <Badge tone="teal">Currency: {currency}</Badge>
        </div>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs font-semibold text-teal-900 shadow-xs">
          <CheckCircle className="size-4 text-teal-700" />
          <span>{savedNotice}</span>
        </div>
      )}

      {testResult && (
        <div className="flex items-center justify-between rounded-xl border border-ok-200 bg-ok-50 px-4 py-3 text-xs font-semibold text-ok-800 shadow-xs">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-ok-700" />
            <span>
              Connection test to <strong>{testResult.gateway.toUpperCase()}</strong> passed in{' '}
              <span className="font-mono">{testResult.latency_ms}ms</span> ({testResult.message})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTestResult(null)}
            className="text-xs text-ok-700 hover:text-ok-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* GLOBAL SETTINGS CARD */}
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200">
            <h3 className="font-bold text-ink-900 text-sm">Global Billing Environment</h3>
          </CardHeader>
          <CardBody className="p-5">
            <div className="grid gap-4 sm:grid-cols-4 text-xs">
              <div>
                <label className="font-bold text-ink-800 block mb-1">Active Card Processor:</label>
                <select
                  value={activeGateway}
                  onChange={(e) => setActiveGateway(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                >
                  <option value="stripe">Stripe</option>
                  <option value="braintree">Braintree / PayPal</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Processing Mode:</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'sandbox' | 'live')}
                  className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                >
                  <option value="sandbox">Sandbox / Testing</option>
                  <option value="live">Live Production</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Settlement Currency:</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Recurring Auto-Billing:</label>
                <button
                  type="button"
                  onClick={() => setAutoBilling(!autoBilling)}
                  className="flex items-center gap-2 mt-1 text-xs font-bold text-ink-800"
                >
                  {autoBilling ? (
                    <ToggleRight className="size-6 text-teal-600" />
                  ) : (
                    <ToggleLeft className="size-6 text-ink-400" />
                  )}
                  <span>{autoBilling ? 'Automated Renewal' : 'Manual Invoicing'}</span>
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 3 GATEWAY CARDS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* STRIPE */}
          <Card>
            <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                  <CreditCard className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold text-ink-900 text-sm">Online Credit Cards (Stripe)</h3>
                  <p className="text-[11px] text-ink-500">Tokenized card processing with webhooks</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStripeEnabled(!stripeEnabled)}
                className="flex items-center gap-1.5 text-xs font-bold text-ink-700"
              >
                {stripeEnabled ? (
                  <ToggleRight className="size-6 text-teal-600" />
                ) : (
                  <ToggleLeft className="size-6 text-ink-400" />
                )}
                <span>{stripeEnabled ? 'Active' : 'Off'}</span>
              </button>
            </CardHeader>
            <CardBody className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink-800 block mb-1">Publishable Key:</label>
                <input
                  type="text"
                  value={stripePublishableKey}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                  placeholder="pk_test_..."
                  className="w-full font-mono rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                />
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Secret Key:</label>
                <input
                  type="password"
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  placeholder="sk_test_..."
                  className="w-full font-mono rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                />
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Webhook Secret:</label>
                <input
                  type="password"
                  value={stripeWebhookSecret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full font-mono rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => handleTestPing('stripe')}
                  disabled={testGatewayMutation.isPending}
                >
                  <Zap className="size-3.5" />
                  <span>Test Gateway Ping</span>
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* BANK WIRE */}
          <Card>
            <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-cream-200 text-ink-800">
                  <Building className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold text-ink-900 text-sm">Direct Bank Wire Transfer</h3>
                  <p className="text-[11px] text-ink-500">Corporate & clinical invoice wire settlement</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBankEnabled(!bankEnabled)}
                className="flex items-center gap-1.5 text-xs font-bold text-ink-700"
              >
                {bankEnabled ? (
                  <ToggleRight className="size-6 text-teal-600" />
                ) : (
                  <ToggleLeft className="size-6 text-ink-400" />
                )}
                <span>{bankEnabled ? 'Active' : 'Off'}</span>
              </button>
            </CardHeader>
            <CardBody className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-800 block mb-1">Bank Name:</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-800 block mb-1">Beneficiary Name:</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-800 block mb-1">Account Number:</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full font-mono rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-800 block mb-1">Routing / Swift Code:</label>
                  <input
                    type="text"
                    value={routingCode}
                    onChange={(e) => setRoutingCode(e.target.value)}
                    className="w-full font-mono rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Transfer Memo Instructions:</label>
                <textarea
                  value={bankInstructions}
                  onChange={(e) => setBankInstructions(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                />
              </div>
            </CardBody>
          </Card>

          {/* CASH & CLINIC VOUCHER */}
          <Card className="lg:col-span-2">
            <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <Banknote className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold text-ink-900 text-sm">Cash & Clinic Voucher Settlement</h3>
                  <p className="text-[11px] text-ink-500">In-person health center and local cash settlement queue</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCashEnabled(!cashEnabled)}
                className="flex items-center gap-1.5 text-xs font-bold text-ink-700"
              >
                {cashEnabled ? (
                  <ToggleRight className="size-6 text-teal-600" />
                ) : (
                  <ToggleLeft className="size-6 text-ink-400" />
                )}
                <span>{cashEnabled ? 'Active' : 'Off'}</span>
              </button>
            </CardHeader>
            <CardBody className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink-800 block mb-1">Client Settlement Instructions:</label>
                <textarea
                  value={cashInstructions}
                  onChange={(e) => setCashInstructions(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-300">
          <Button
            size="sm"
            type="submit"
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Gateway Configurations'}
          </Button>
        </div>
      </form>
    </div>
  )
}
