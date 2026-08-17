import { aggregate, getStats } from './stats'
import type { StatsState } from './stats'

interface ReportRow {
  scene: string
  item: string
  count: number
}

export interface ReportPayload {
  ts: string
  total: number
  choice: string | null
  rows: ReportRow[]
}

function buildPayload(s: StatsState): ReportPayload {
  const { groups, total } = aggregate(s)
  const rows: ReportRow[] = []
  for (const g of groups) for (const it of g.items) rows.push({ scene: g.scene, item: it.label, count: it.count })

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  return { ts, total, choice: s.choice, rows }
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