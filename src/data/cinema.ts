export interface CinemaCard {
  id: string
  genre: string
  hidden: string
  correct: boolean
}

export const cinemaKicker = 'сегодня в кино'

export const cinemaTask = 'Выбирай. Один из этих вариантов — правильный.'

export const cinemaCards: CinemaCard[] = [
  {
    id: 'melodrama',
    genre: 'Мелодрама',
    hidden: 'Фильм на 2 часа',
    correct: false,
  },
  {
    id: 'action',
    genre: 'Боевик',
    hidden: 'Обсуждение фильма ещё на 3 часа',
    correct: false,
  },
  {
    id: 'comedy',
    genre: 'Комедия',
    hidden: 'Разговоры после фильма до ночи',
    correct: false,
  },
  {
    id: 'special',
    genre: '?',
    hidden: 'Конечно же, всё сразу',
    correct: true,
  },
]

export const cinemaWrong: Record<string, string> = {
  melodrama: 'Только 2 часа? Подозрительно мало.',
  action: 'Уже теплее. Но всё ещё не то.',
  comedy: 'Горячо. Почти. Но нет.',
}

export const cinemaCorrect = [
  'Вот именно.',
  'Мне почему-то кажется, что с тобой даже фильм — это не главное.',
]
