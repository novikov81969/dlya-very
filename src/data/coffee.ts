export interface CoffeeItem {
  id: string
  icon: string
  name: string
  correct: boolean
  wrongMsg?: string
}

export const coffeeTask = [
  'Вот моё рабочее место.',
  'В нём чего-то не хватает. Вернее — кое-кто однажды принёс сюда то, что превратило обычный день в особенный.',
  'Выбери, что это было.',
]

export const coffeeItems: CoffeeItem[] = [
  { id: 'coffee', icon: '☕', name: 'Кофе', correct: true },
  { id: 'waffles', icon: '🧇', name: 'Вафли', correct: true },
  { id: 'note', icon: '💌', name: 'Записка', correct: true },
  {
    id: 'mouse',
    icon: '🖱️',
    name: 'Мышь',
    correct: false,
    wrongMsg: 'Это мышь. У неё работа, а не свидания.',
  },
  {
    id: 'folder',
    icon: '📁',
    name: 'Папка',
    correct: false,
    wrongMsg: 'Пусто. Как календарь до одного очень важного знакомства.',
  },
  {
    id: 'keyboard',
    icon: '⌨️',
    name: 'Клавиатура',
    correct: false,
    wrongMsg: 'Пробел, Enter, Esc… не тот набор.',
  },
  {
    id: 'report',
    icon: '📊',
    name: 'Отчёт',
    correct: false,
    wrongMsg: 'Ты приносила отчёты? Нет, такого не было. И не надо.',
  },
  {
    id: 'donut',
    icon: '🍩',
    name: 'Пончик',
    correct: false,
    wrongMsg: 'Пончик — вкусно. Но в тот день порядок был строже.',
  },
]

export const coffeeFound = [
  'Кажется, кое-кто однажды пришёл после моей работы не с пустыми руками.',
  'И почему-то после этого день стал намного приятнее.',
]
