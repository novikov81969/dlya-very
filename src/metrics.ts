import { memoryItems } from './data/memory'
import { coffeeItems } from './data/coffee'
import { cinemaCards } from './data/cinema'
import { yesButtons } from './data/letter'

export interface ButtonSpec {
  scene: 'Начало' | 'Память' | 'Кофе' | 'Кино' | 'Сердце' | 'Конверт'
  icon: string
  label: string
}

const START: ButtonSpec = { scene: 'Начало', icon: '🚀', label: 'Начать' }

function buildCatalog(): ButtonSpec[] {
  const list: ButtonSpec[] = [START]
  for (const i of memoryItems) list.push({ scene: 'Память', icon: i.icon, label: i.label })
  list.push({ scene: 'Память', icon: '🕵️', label: 'Скрытая записка ✨' })
  for (const c of coffeeItems) list.push({ scene: 'Кофе', icon: c.icon, label: c.name + (c.correct ? ' ✓' : ' ✗') })
  for (const c of cinemaCards) list.push({ scene: 'Кино', icon: '🎬', label: (c.correct ? '✔ ' : '✗ ') + c.hidden })
  list.push({ scene: 'Сердце', icon: '💗', label: 'нажатие на сердце' })
  list.push({ scene: 'Конверт', icon: '✉️', label: 'открыт' })
  list.push({ scene: 'Конверт', icon: '🚫', label: '"нет" · попытка' })
  list.push({ scene: 'Конверт', icon: '🚫', label: '"нет" · попыток: 5+' })
  for (const label of yesButtons) list.push({ scene: 'Конверт', icon: '💌', label })
  return list
}

export const CATALOG: ButtonSpec[] = buildCatalog()
export const ALL_BUTTONS: string[] = CATALOG.map((b) => b.label)