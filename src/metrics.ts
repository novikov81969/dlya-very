import { memoryItems } from './data/memory'
import { coffeeItems } from './data/coffee'
import { cinemaCards } from './data/cinema'

function buildCatalog(): string[] {
  const list: string[] = []
  list.push('Начать')
  for (const i of memoryItems) list.push(i.label)
  list.push('Скрытая записка ✨')
  for (const c of coffeeItems) list.push(c.name + (c.correct ? ' ✓' : ' ✗'))
  for (const c of cinemaCards) list.push((c.correct ? '✔ ' : '✗ ') + c.hidden)
  list.push('нажатие на сердце')
  list.push('открыт', '"нет" · попытка', '"нет" · попыток: 5+')
  return list
}

export const ALL_BUTTONS: string[] = buildCatalog()