const KEY = 'vera-quest-stats-v1'

export interface StatsState {
  counts: Record<string, number>
  choice: string | null
}

function empty(): StatsState {
  return { counts: {}, choice: null }
}

function read(): StatsState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as StatsState
  } catch {
    /* ignore */
  }
  return empty()
}

function write(s: StatsState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export function bump(scene: string, label: string) {
  const s = read()
  const key = `${scene} :: ${label}`
  s.counts[key] = (s.counts[key] ?? 0) + 1
  write(s)
}

export function setChoice(choice: string) {
  const s = read()
  s.choice = choice
  write(s)
}

export function resetStats() {
  write(empty())
}

export function getStats(): StatsState {
  return read()
}

export interface Aggregated {
  scene: string
  items: { label: string; count: number }[]
}

export function aggregate(stats: StatsState): { groups: Aggregated[]; total: number } {
  const map = new Map<string, { label: string; count: number }[]>()
  for (const [key, count] of Object.entries(stats.counts)) {
    const idx = key.indexOf(' :: ')
    const scene = idx >= 0 ? key.slice(0, idx) : 'разное'
    const label = idx >= 0 ? key.slice(idx + 4) : key
    const list = map.get(scene) ?? []
    list.push({ label, count })
    map.set(scene, list)
  }
  const groups: Aggregated[] = [...map.entries()].map(([scene, items]) => ({ scene, items }))
  const total = groups.reduce((s, g) => s + g.items.reduce((a, i) => a + i.count, 0), 0)
  return { groups, total }
}