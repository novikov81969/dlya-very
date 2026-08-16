import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { coffeeFound, coffeeItems, coffeeTask } from '../../data/coffee'
import { RevealLines } from '../RevealLines'
import type { SceneProps } from '../../types'

export function CoffeeScene({ onNext }: SceneProps) {
  const [foundCorrect, setFoundCorrect] = useState<string[]>([])
  const [wrongMsg, setWrongMsg] = useState<string | null>(null)
  const [shakingId, setShakingId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const correctIds = coffeeItems.filter((i) => i.correct).map((i) => i.id)
  const completed = correctIds.every((id) => foundCorrect.includes(id))

  const pick = (item: (typeof coffeeItems)[number]) => {
    if (item.correct) {
      setFoundCorrect((f) => (f.includes(item.id) ? f : [...f, item.id]))
    } else {
      setWrongMsg(item.wrongMsg ?? null)
      setShakingId(item.id)
    }
  }

  return (
    <div className="scene">
      <RevealLines lines={coffeeTask} gap={1000} startAfter={300} lineClassName="line" />

      <div className="desk glass">
        <div className="desk-grid">
          {coffeeItems.map((item) => {
            const isFound = foundCorrect.includes(item.id)
            return (
              <motion.button
                type="button"
                key={item.id}
                className={`desk-tile glass${isFound ? ' correct-found disabled' : ''}`}
                disabled={isFound}
                whileTap={!isFound ? { scale: 0.94 } : undefined}
                animate={shakingId === item.id ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                onAnimationComplete={() => setShakingId(null)}
                onClick={() => pick(item)}
              >
                <span className="item-icon">{item.icon}</span>
                <span>{item.name}</span>
                {isFound && <span style={{ fontSize: 14, color: 'var(--rose)' }}>✓</span>}
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {wrongMsg && !completed && (
          <motion.p
            key={wrongMsg}
            className="wrong-note"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {wrongMsg}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completed && (
          <motion.div
            key="done"
            className="glass quote-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <RevealLines
              lines={coffeeFound}
              gap={1400}
              startAfter={400}
              lineClassName="line"
              onDone={() => setReady(true)}
            />
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
            onClick={() => onNext('cinema')}
          >
            дальше
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
