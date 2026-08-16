import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { cinemaCards, cinemaCorrect, cinemaKicker, cinemaTask, cinemaWrong } from '../../data/cinema'
import { RevealLines } from '../RevealLines'
import type { SceneProps } from '../../types'

export function CinemaScene({ onNext }: SceneProps) {
  const [opened, setOpened] = useState<string[]>([])
  const [wrongNote, setWrongNote] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)

const open = (card: (typeof cinemaCards)[number]) => {
    if (opened.includes(card.id)) return
    setOpened((o) => [...o, card.id])

    if (card.correct) {
      setDone(true)
    } else {
      setWrongNote(cinemaWrong[card.id] ?? 'не то')
    }
  }

  return (
    <div className="scene">
      <motion.p className="kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        {cinemaKicker}
      </motion.p>

      <RevealLines lines={[cinemaTask]} gap={300} startAfter={400} lineClassName="line" />

      <div className="cinema-grid">
        {cinemaCards.map((card, i) => {
          const isOpen = opened.includes(card.id)
          return (
            <div className="perspective" key={card.id}>
              <motion.div
                className={`cinema-card${done && card.correct ? ' done' : ''}`}
                initial={{ opacity: 0, y: 22 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotateY: isOpen ? 180 : 0,
                  transition: { delay: isOpen ? 0 : 0.3 + i * 0.12, duration: 0.55 },
                }}
                whileTap={!isOpen ? { scale: 0.97 } : undefined}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => open(card)}
              >
                <div className="cinema-face card-front glass">
                  <span className="genre">{card.genre}</span>
                  <span className="tagline">посмотреть</span>
                </div>
                <div className="cinema-face card-back">
                  <span className="tagline">{card.hidden}</span>
                  {!card.correct && <span style={{ fontSize: 12, opacity: 0.7 }}>не то</span>}
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {wrongNote && !done && (
          <motion.p
            key={wrongNote}
            className="wrong-note"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {wrongNote}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div
            key="done"
            className="glass quote-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            <RevealLines lines={cinemaCorrect} gap={1400} startAfter={300} lineClassName="line" onDone={() => setReady(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && (
          <motion.button
            type="button"
            className="btn btn-primary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => onNext('heart')}
          >
            дальше
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
