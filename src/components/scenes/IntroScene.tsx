import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { RevealLines } from '../RevealLines'
import { introButton, introHint, introLines } from '../../data/intro'
import { bump } from '../../stats'
import type { SceneProps } from '../../types'

export function IntroScene({ onNext }: SceneProps) {
  const [ready, setReady] = useState(false)

  return (
    <div className="scene">
      <RevealLines
        lines={introLines}
        gap={1700}
        startAfter={800}
        className="soundlines"
        lineClassName="line"
        onDone={() => setReady(true)}
      />

      <AnimatePresence>
        {ready && (
          <motion.div
            key="start"
            className="row"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
<button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                bump('Начало', 'Начать')
                onNext('memory')
              }}
            >
              {introButton}
            </button>
            <p className="hint" style={{ margin: '4px 0 0', width: '100%', fontSize: 13, color: 'var(--muted)' }}>
              {introHint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
