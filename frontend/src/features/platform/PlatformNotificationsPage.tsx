import { useState } from 'react'
import {
  CheckCircle,
  Radio,
  Clock
} from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { TextField, SelectField, TextAreaField } from '../../components/ui/Field'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

interface BroadcastLog {
  id: string
  title: string
  channels: string[]
  recipients: number
  date: string
  status: 'Delivered' | 'Queued'
}

export function PlatformNotificationsPage() {
  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [targetAudience, setTargetAudience] = useState<'all' | 'caregivers' | 'seniors'>('all')
  const [channelPush, setChannelPush] = useState(true)
  const [channelEmail, setChannelEmail] = useState(true)
  const [channelInApp, setChannelInApp] = useState(true)
  const [channelSMS, setChannelSMS] = useState(false)

  // System Channel Toggles
  const [enableVoiceGateway, setEnableVoiceGateway] = useState(true)
  const [enablePushGateway, setEnablePushGateway] = useState(true)
  const [enableSMSGateway, setEnableSMSGateway] = useState(true)

  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastLog[]>([
    {
      id: 'BC-904',
      title: 'Scheduled Maintenance Notice: Nov 12 at 03:00 UTC',
      channels: ['In-App', 'Email'],
      recipients: 4820,
      date: '2026-11-08',
      status: 'Delivered',
    },
    {
      id: 'BC-903',
      title: 'New Feature: Automated Preferred Pharmacy Connect Live',
      channels: ['In-App'],
      recipients: 4790,
      date: '2026-10-30',
      status: 'Delivered',
    },
  ])

  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastTitle || !broadcastMessage) return

    const newLog: BroadcastLog = {
      id: `BC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: broadcastTitle,
      channels: [
        ...(channelInApp ? ['In-App'] : []),
        ...(channelPush ? ['Push'] : []),
        ...(channelEmail ? ['Email'] : []),
        ...(channelSMS ? ['SMS'] : []),
      ],
      recipients: targetAudience === 'all' ? 4850 : 2400,
      date: new Date().toISOString().split('T')[0],
      status: 'Delivered',
    }

    setBroadcastLogs((prev) => [newLog, ...prev])
    setStatusMessage(`System broadcast "${broadcastTitle}" dispatched to ${newLog.recipients} recipients.`)
    setTimeout(() => setStatusMessage(null), 4000)

    setBroadcastTitle('')
    setBroadcastMessage('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink-900">System Notification System</h2>
          <p className="text-sm text-ink-500">
            Dispatch platform announcements, manage global notification channels, and review delivery health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnablePushGateway(!enablePushGateway)}
            className="cursor-pointer"
            title="Click to toggle push gateway"
          >
            <Badge tone={enablePushGateway ? 'teal' : 'neutral'}>
              Push Gateway: {enablePushGateway ? 'ON' : 'OFF'}
            </Badge>
          </button>
          <button
            type="button"
            onClick={() => setEnableVoiceGateway(!enableVoiceGateway)}
            className="cursor-pointer"
            title="Click to toggle voice cascade gateway"
          >
            <Badge tone={enableVoiceGateway ? 'teal' : 'neutral'}>
              Voice Cascade: {enableVoiceGateway ? 'ON' : 'OFF'}
            </Badge>
          </button>
          <button
            type="button"
            onClick={() => setEnableSMSGateway(!enableSMSGateway)}
            className="cursor-pointer"
            title="Click to toggle SMS gateway"
          >
            <Badge tone={enableSMSGateway ? 'teal' : 'neutral'}>
              SMS Gateway: {enableSMSGateway ? 'ON' : 'OFF'}
            </Badge>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-xl bg-ok-50 border border-ok-200 p-4 text-xs font-semibold text-ok-700 flex items-center gap-2">
          <CheckCircle className="size-4" />
          {statusMessage}
        </div>
      )}

      {/* Broadcast Composer & Channel Controls */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Compose Broadcast */}
        <div className="lg:col-span-7">
          <Card as="div">
            <CardBody className="p-6">
              <h3 className="text-base font-bold text-ink-900 mb-2 flex items-center gap-2">
                <Radio className="size-4 text-teal-700" />
                Dispatch System-Wide Announcement
              </h3>
              <p className="text-xs text-ink-500 mb-4">
                Broadcast an urgent alert or system notice to user dashboards and active client devices.
              </p>

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                <TextField
                  id="broadcast-title"
                  label="Announcement Headline"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Critical System Update or Service Announcement"
                  required
                />

                <TextAreaField
                  id="broadcast-message"
                  label="Broadcast Message Content"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  placeholder="Type the message that will appear in user notification centers..."
                  required
                />

                <SelectField
                  id="target-audience"
                  label="Target Audience Segment"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as 'all' | 'caregivers' | 'seniors')}
                  options={[
                    { value: 'all', label: 'All Users (Caregivers, Seniors & Self-Users)' },
                    { value: 'caregivers', label: 'Primary & Secondary Caregivers Only' },
                    { value: 'seniors', label: 'Senior Patient Mobile Apps Only' },
                  ]}
                />

                {/* Dispatch Channels */}
                <div>
                  <span className="block font-bold text-ink-900 mb-2">Delivery Channels</span>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-ink-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channelInApp}
                        onChange={(e) => setChannelInApp(e.target.checked)}
                        className="rounded accent-teal-600 size-4"
                      />
                      In-App Notification Center
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channelPush}
                        onChange={(e) => setChannelPush(e.target.checked)}
                        className="rounded accent-teal-600 size-4"
                      />
                      System Push Notification
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channelEmail}
                        onChange={(e) => setChannelEmail(e.target.checked)}
                        className="rounded accent-teal-600 size-4"
                      />
                      Email Announcement
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channelSMS}
                        onChange={(e) => setChannelSMS(e.target.checked)}
                        className="rounded accent-teal-600 size-4"
                      />
                      SMS Text (Urgent Only)
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-cream-200 flex justify-end">
                  <Button variant="primary" size="sm" type="submit">
                    Send Platform Broadcast
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Right: Global Channel Rules & Health */}
        <div className="lg:col-span-5 space-y-6">
          <Card as="div">
            <CardBody className="p-6 space-y-4 text-xs">
              <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
                <Clock className="size-4 text-teal-700" />
                Quiet Hours & Throttling Defaults
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-cream-100">
                  <div>
                    <span className="font-bold text-ink-900">Global Quiet Hours Window</span>
                    <p className="text-[11px] text-ink-500">Mutes non-critical calls between 10:00 PM – 7:30 AM</p>
                  </div>
                  <Badge tone="teal">Enforced</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-cream-100">
                  <div>
                    <span className="font-bold text-ink-900">Anti-Spam Daily Budget</span>
                    <p className="text-[11px] text-ink-500">Max 5 automated voice attempts / day per circle</p>
                  </div>
                  <Badge tone="teal">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-cream-100">
                  <div>
                    <span className="font-bold text-ink-900">Emergency Override</span>
                    <p className="text-[11px] text-ink-500">SOS Lifeline button bypasses quiet hours</p>
                  </div>
                  <Badge tone="teal">Active</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Delivery Telemetry */}
          <Card as="div">
            <CardBody className="p-6 space-y-3 text-xs">
              <h3 className="text-base font-bold text-ink-900">Notification Health (24h)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-cream-100 p-3 text-center">
                  <span className="text-xl font-extrabold text-ok-700 tabular-nums">99.8%</span>
                  <p className="text-[11px] text-ink-500 font-bold">Push Success</p>
                </div>
                <div className="rounded-xl bg-cream-100 p-3 text-center">
                  <span className="text-xl font-extrabold text-teal-700 tabular-nums">1.2s</span>
                  <p className="text-[11px] text-ink-500 font-bold">Avg Dispatch Latency</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Broadcast History Table */}
      <Card as="div">
        <CardBody className="p-0 overflow-x-auto">
          <div className="px-5 py-3 border-b border-cream-200">
            <h4 className="font-bold text-ink-900 text-sm">Broadcast History</h4>
          </div>
          <table className="w-full text-left text-xs text-ink-700">
            <thead className="border-b border-cream-200 bg-cream-100 text-ink-900 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">ID & Title</th>
                <th className="px-4 py-3">Channels</th>
                <th className="px-4 py-3">Recipients</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {broadcastLogs.map((log) => (
                <tr key={log.id} className="hover:bg-cream-50/70">
                  <td className="px-5 py-3">
                    <span className="font-mono font-bold text-sage-800">{log.id}</span>
                    <p className="font-semibold text-ink-900">{log.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {log.channels.map((ch) => (
                        <span key={ch} className="rounded bg-cream-200 px-1.5 py-0.5 text-[10px] font-bold">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums font-bold text-ink-900">
                    {log.recipients.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-ink-500 tabular-nums">{log.date}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge tone="teal">{log.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
