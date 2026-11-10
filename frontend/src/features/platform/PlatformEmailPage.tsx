import { useState } from 'react'
import {
  Send,
  CheckCircle,
  Server,
  Bell,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { LoadingState } from '../../components/ui/states'
import type { EmailSettings } from '../../lib/types'
import {
  useEmailSettings,
  useTestEmail,
  useUpdateEmailSettings,
} from './hooks'

export function PlatformEmailPage() {
  const { data: settings, isPending } = useEmailSettings()

  if (isPending || !settings) {
    return (
      <div className="py-12">
        <LoadingState label="Loading email infrastructure configuration..." />
      </div>
    )
  }

  return <EmailPageContent settings={settings} />
}

function EmailPageContent({ settings }: { settings: EmailSettings }) {
  const [activeTab, setActiveTab] = useState<'smtp' | 'templates'>('smtp')

  const updateSettingsMutation = useUpdateEmailSettings()
  const testEmailMutation = useTestEmail()

  // SMTP Settings
  const [mailer, setMailer] = useState(settings.mailer || 'smtp')
  const [host, setHost] = useState(settings.host || '')
  const [port, setPort] = useState(settings.port || 587)
  const [encryption, setEncryption] = useState(settings.encryption || 'tls')
  const [username, setUsername] = useState(settings.username || '')
  const [password, setPassword] = useState(settings.password || '')
  const [fromAddress, setFromAddress] = useState(settings.from_address || '')
  const [fromName, setFromName] = useState(settings.from_name || '')

  // Templates
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; enabled: boolean }>>(
    settings.templates || [],
  )

  // Test email state
  const [testRecipient, setTestRecipient] = useState('')
  const [testResult, setTestResult] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSaveSMTP = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettingsMutation.mutateAsync({
        mailer,
        host,
        port: Number(port),
        encryption,
        from_address: fromAddress,
        from_name: fromName,
        templates,
      })
      setStatusMessage('SMTP & Mail Driver settings saved successfully.')
      setTimeout(() => setStatusMessage(null), 4000)
    } catch (err) {
      alert('Failed to save settings: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleSendTestEmail = async () => {
    if (!testRecipient) return
    try {
      const res = await testEmailMutation.mutateAsync(testRecipient)
      setTestResult(`Test email dispatched successfully to ${res.recipient} (${res.message})`)
      setTimeout(() => setTestResult(null), 6000)
    } catch (err) {
      alert('Test failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleToggleTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-4">
        <PageHeader
          title="Email Configuration"
          description="Outgoing mail server (SMTP), sender addresses, test email dispatcher, and automated clinical notification templates."
        />

        <div className="flex rounded-xl bg-cream-200/80 p-1 text-xs font-bold text-ink-700">
          <button
            type="button"
            onClick={() => setActiveTab('smtp')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'smtp' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
            }`}
          >
            SMTP & Mail Server
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'templates' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
            }`}
          >
            Notification Templates ({templates.length})
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-ok-50 border border-ok-200 p-4 text-xs font-semibold text-ok-700 shadow-xs">
          <CheckCircle className="size-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {testResult && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 p-4 text-xs font-semibold text-teal-800 shadow-xs">
          <CheckCircle className="size-4 text-teal-600" />
          <span>{testResult}</span>
        </div>
      )}

      {activeTab === 'smtp' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                    <Server className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink-900 text-sm">SMTP Server Settings</h3>
                    <p className="text-[11px] text-ink-500">Mail transport agent & authentication</p>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="p-5">
                <form onSubmit={handleSaveSMTP} className="space-y-4 text-xs">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-ink-800 block mb-1">Mailer Driver:</label>
                      <select
                        value={mailer}
                        onChange={(e) => setMailer(e.target.value)}
                        className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                      >
                        <option value="smtp">SMTP</option>
                        <option value="mailgun">Mailgun API</option>
                        <option value="ses">Amazon SES</option>
                        <option value="postmark">Postmark</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-ink-800 block mb-1">SMTP Host:</label>
                      <input
                        type="text"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="smtp.mailgun.org"
                        className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-ink-800 block mb-1">Port & TLS:</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={port}
                          onChange={(e) => setPort(Number(e.target.value))}
                          className="w-20 rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
                        />
                        <select
                          value={encryption}
                          onChange={(e) => setEncryption(e.target.value)}
                          className="flex-1 rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                        >
                          <option value="tls">TLS</option>
                          <option value="ssl">SSL</option>
                          <option value="starttls">STARTTLS</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-ink-800 block mb-1">Username / API Key:</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-ink-800 block mb-1">Password / Secret:</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-cream-200">
                    <div>
                      <label className="font-bold text-ink-800 block mb-1">From Sender Email:</label>
                      <input
                        type="email"
                        value={fromAddress}
                        onChange={(e) => setFromAddress(e.target.value)}
                        placeholder="notifications@carecircle.app"
                        className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-ink-800 block mb-1">From Sender Name:</label>
                      <input
                        type="text"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        placeholder="CareCircle Health Notifications"
                        className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      size="sm"
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                    >
                      {updateSettingsMutation.isPending ? 'Saving...' : 'Save Mail Settings'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader className="px-5 py-4 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <Send className="size-4 text-teal-700" />
                  <h3 className="font-bold text-ink-900 text-sm">Send Test Dispatch</h3>
                </div>
              </CardHeader>
              <CardBody className="p-5 space-y-4 text-xs">
                <p className="text-ink-600">
                  Verify DNS SPF, DKIM, and SMTP credentials by dispatching a live diagnostic message.
                </p>

                <div>
                  <label className="font-bold text-ink-800 block mb-1">Destination Address:</label>
                  <input
                    type="email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="operator@carecircle.app"
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                  />
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={handleSendTestEmail}
                  disabled={!testRecipient || testEmailMutation.isPending}
                >
                  <Send className="size-3.5" />
                  <span>{testEmailMutation.isPending ? 'Dispatching...' : 'Dispatch Test Email'}</span>
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-ink-900 text-sm">Automated Email Notification Templates</h3>
              <p className="text-[11px] text-ink-500">Enable or disable system-triggered customer notification dispatches</p>
            </div>
            <Button
              size="sm"
              onClick={handleSaveSMTP}
              disabled={updateSettingsMutation.isPending}
            >
              Save Template Changes
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-cream-100">
              {templates.map((tpl) => (
                <div key={tpl.id} className="flex items-center justify-between p-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                      <Bell className="size-4" />
                    </span>
                    <div>
                      <p className="font-bold text-ink-900">{tpl.name}</p>
                      <p className="text-[11px] text-ink-500 font-mono">Template ID: {tpl.id}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTemplate(tpl.id)}
                    className="flex items-center gap-2 text-xs font-bold text-ink-800"
                  >
                    {tpl.enabled ? (
                      <ToggleRight className="size-6 text-teal-600" />
                    ) : (
                      <ToggleLeft className="size-6 text-ink-400" />
                    )}
                    <span>{tpl.enabled ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
