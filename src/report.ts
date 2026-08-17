import { getStats } from './stats'
import { ALL_BUTTONS } from './metrics'
import type { StatsState } from './stats'

export interface ReportPayload {
  ts: string
  total: number
  choice: string | null
  counts: Record<string, number>
}

function buildPayload(s: StatsState): ReportPayload {
  const counts: Record<string, number> = {}
  for (const key of ALL_BUTTONS) counts[key] = 0

  let total = 0
  for (const [key, count] of Object.entries(s.counts)) {
    const idx = key.indexOf(' :: ')
    const label = idx >= 0 ? key.slice(idx + 4) : key
    if (label in counts) {
      counts[label] += count
      total += count
    }
  }

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  return { ts, total, choice: s.choice, counts }
}

export function sendReport(): void {
  const url = (import.meta.env.VITE_SHEETS_WEBHOOK as string | undefined)?.trim()
  if (!url) return
  const payload = buildPayload(getStats())
  try {
    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    }).catch(() => {})
  } catch {
    /* ignore */
  }
}