import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  letterAsk,
  letterBody,
  letterSetup,
  letterSub,
  noButtonStart,
  noEscapeLines,
  yesButtons,
} from '../../data/letter'
import { RevealLines } from '../RevealLines'
import type { SceneProps } from '../../types'

type Phase = 'setup' | 'envelope' | 'opening' | 'ask'

interface EscPos {
  x: number
  y: number
}

export function LetterScene({ onNext }: SceneProps) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [askStep, setAskStep] = useState(0)
  const [escPos, setEscPos] = useState<EscPos>({ x: 14, y: 40 })
  const [escAttempts, setEscAttempts] = useState(0)
  const [escLine, setEscLine] = useState<string | null>(null)
  const [escGone, setEscGone] = useState(false)

  const openEnvelope = () => {
    if (phase !== 'envelope') return
    setPhase('opening')
    window.setTimeout(() => setPhase('ask'), 1150)
  }

  useEffect(() => {
    if (phase !== 'ask') {
      setAskStep(0)
      return
    }
    if (askStep >= 2) return
    const t = window.setTimeout(() => setAskStep((s) => s + 1), askStep === 0 ? 800 : 1200)
    return () => window.clearTimeout(t)
  }, [phase, askStep])

  const dodgeNo = () => {
    const attempts = escAttempts + 1
    setEscAttempts(attempts)
    if (attempts > 4) {
      setEscGone(true)
      setEscLine('Молчу. Я не мешаю. Выбирай спокойно :)')
      return
    }
    setEscPos({ x: 6 + Math.random() * 78, y: 30 + Math.random() * 45 })
    setEscLine(noEscapeLines[(attempts - 1) % noEscapeLines.length])
  }

  return (
    <div className="scene">
      {phase === 'setup' && (
        <RevealLines lines={letterSetup} gap={1300} startAfter={700} lineClassName="line" onDone={() => setPhase('envelope')} />
      )}

      <AnimatePresence mode="wait">
        {(phase === 'envelope' || phase === 'opening') && (
          <motion.div
            key="envelope"
            className="envelope"
            onClick={openEnvelope}
            initial={{ opacity: 0, y: 26, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="env-front" />
            <motion.span
              className="env-flap"
              animate={{ rotateX: phase === 'opening' ? 180 : 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
            />
            <motion.span
              className="env-seal"
              animate={{ opacity: phase === 'opening' ? 0 : 1, scale: phase === 'opening' ? 1.4 : 1 }}
              transition={{ duration: 0.45 }}
            >
              ❤️
            </motion.span>
            {phase === 'envelope' && (
              <motion.span
                className="heart-tap-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{ position: 'absolute', bottom: -34, left: 0, right: 0, textAlign: 'center' }}
              >
                нажми на конверт
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'ask' && (
          <motion.div
            key="letter"
            className="letter-card"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.span className="serif" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              {askStep >= 0 ? letterBody : ''}
            </motion.span>
            {askStep >= 1 && (
              <motion.p className="ask" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
                {letterAsk}
              </motion.p>
            )}
            {askStep >= 1 && (
              <motion.p className="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
                {letterSub}
              </motion.p>
            )}

            <AnimatePresence>
              {askStep >= 2 && (
                <motion.div
                  className="row"
                  style={{ position: 'relative', marginTop: 22 }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {yesButtons.map((label, i) => (
                    <motion.button
                      type="button"
                      key={label}
                      className={i === 0 ? 'btn btn-primary' : 'btn btn-primary-alt'}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onNext('finale')}
                      animate={{ scale: 1 }}
                    >
                      {label}
                    </motion.button>
                  ))}

                  {!escGone && (
                    <motion.button
                      type="button"
                      className="btn btn-escape"
                      style={{ left: `${escPos.x}%`, top: `${escPos.y}%` }}
                      animate={{ left: `${escPos.x}%`, top: `${escPos.y}%` }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                      whileHover={{ scale: 0.9 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={dodgeNo}
                      onClick={dodgeNo}
                    >
                      {noButtonStart}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
{escLine && (
          <motion.div
            key={escLine}
            className="toast"
            initial={{ opacity: 0, y: 16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 16, x: '-50%' }}
            transition={{ duration: 0.4 }}
          >
            {escLine}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
