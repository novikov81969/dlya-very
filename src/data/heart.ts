export interface HeartLine {
  text: string
  wiggle?: boolean
}

export const heartLines: HeartLine[] = [
  { text: 'Ты однажды сказала, что, кажется, потеряла своё сердечко тогда.' },
  { text: 'А я его нашёл.' },
  { text: 'Правда, есть одна проблема...', wiggle: true },
  { text: 'Я уже успел к нему привязаться.' },
]

export const heartTapHints = [
  'Я же сказал: уже привязался 🙃',
  'Щекотно.',
  'Ладно-ладно. Теперь оно точно твоё.',
  'Хватит искать уязвимости — сердце уже сдалось.',
]
