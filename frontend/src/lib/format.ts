/**
 * Formatting helpers. They only ever format values the API returned — nothing
 * here fabricates a number, a date or a label for a missing field.
 */

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' })

function parse(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** e.g. “12 Mar 2026, 08:00”. Returns null when the API sent nothing usable. */
export function formatDateTime(value: string | null | undefined): string | null {
  const date = parse(value)
  return date ? dateTimeFormatter.format(date) : null
}

export function formatDate(value: string | null | undefined): string | null {
  const date = parse(value)
  return date ? dateFormatter.format(date) : null
}

export function formatTime(value: string | null | undefined): string | null {
  const date = parse(value)
  return date ? timeFormatter.format(date) : null
}

/** `HH:MM` (24h) schedule slots come back as plain strings and stay as-is. */
export function formatScheduleTime(value: string): string {
  const match = /^(\d{2}):(\d{2})/.exec(value)
  if (!match) return value
  const hours = Number(match[1])
  const minutes = match[2]
  const suffix = hours >= 12 ? 'pm' : 'am'
  const displayHour = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHour}:${minutes} ${suffix}`
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function formatWeekdays(days: number[]): string | null {
  if (days.length === 0) return null
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_LABELS[day] ?? String(day))
    .join(', ')
}

export function formatNumber(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null
  return new Intl.NumberFormat().format(value)
}

export function formatPercent(value: number | null | undefined, digits = 0): string | null {
  if (value == null || Number.isNaN(value)) return null
  return `${value.toFixed(digits)}%`
}

export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || Number.isNaN(seconds)) return null
  if (seconds < 90) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 90) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder === 0 ? `${hours} h` : `${hours} h ${remainder} min`
}

export function formatBytes(bytes: number | null | undefined): string | null {
  if (bytes == null || Number.isNaN(bytes)) return null
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

/** `YYYY-MM-DD` for API date filters, in local time. */
export function toDateParam(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

/** Value for `<input type="datetime-local">`, preserving local wall-clock time. */
export function toDateTimeLocal(date: Date): string {
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function relativeFromNow(value: string | null | undefined): string | null {
  const date = parse(value)
  if (!date) return null
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60_000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute')
  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
  return rtf.format(Math.round(diffHours / 24), 'day')
}

/* ------------------------------------------------------------------ */
/* “Now” boundaries                                                    */
/* ------------------------------------------------------------------ */

/**
 * The clock lives in this module so components stay pure during render: pages
 * ask “is this in the future?” instead of reading the clock themselves.
 */
export function nowTimestamp(): number {
  return Date.now()
}

/** True when the API timestamp parses and is not in the past. */
export function isUpcoming(value: string | null | undefined): boolean {
  const date = parse(value)
  return date !== null && date.getTime() >= Date.now()
}

export function isPast(value: string | null | undefined): boolean {
  const date = parse(value)
  return date !== null && date.getTime() < Date.now()
}

/** Sorts API timestamps ascending; unparseable values sink to the end. */
export function compareAscending(a: string | null | undefined, b: string | null | undefined): number {
  const left = parse(a)?.getTime() ?? Number.POSITIVE_INFINITY
  const right = parse(b)?.getTime() ?? Number.POSITIVE_INFINITY
  return left - right
}

/** Sorts API timestamps descending. */
export function compareDescending(a: string | null | undefined, b: string | null | undefined): number {
  return compareAscending(b, a)
}
