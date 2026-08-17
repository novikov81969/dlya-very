import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { heartLines, heartTapHints } from '../../data/heart'
import type { SceneProps } from '../../types'

const HEART_SVG =
  'M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,20.6c6.1-8.3,16-11.5,16-20.6C32,3.8,28.2,0,23.6,0z'

export function HeartScene({ onNext }: SceneProps) {
  const [shown, setShown] = useState(0)
  const [wiggle, setWiggle] = useState(false)
  const [taps, setTaps] = useState(0)
  const [hintIdx, setHintIdx] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  const total = heartLines.length
  const mainDone = shown >= total

  useEffect(() => {
    if (shown >= total) return
    const isProblemLine = shown === 2
    const t = window.setTimeout(() => {
      setShown((s) => s + 1)
      if (isProblemLine) {
        setWiggle(true)
        window.setTimeout(() => setWiggle(false), 1600)
      }
    }, shown === 0 ? 900 : 2000)
    return () => window.clearTimeout(t)
  }, [shown, total])

  useEffect(() => {
    if (shown >= total) {
      const t = window.setTimeout(() => setReady(true), 1400)
      return () => window.clearTimeout(t)
    }
  }, [shown, total])

const tapHeart = () => {
    if (!mainDone) return
    const idx = taps % heartTapHints.length
    setHintIdx(idx)
    setTaps((t) => t + 1)
  }

  return (
    <div className="scene">
      <div style={{ minHeight: 96, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {heartLines.slice(0, shown).map((line, i) => (
          <motion.p
            key={i}
            className="line"
            initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {line.text}
          </motion.p>
        ))}
      </div>

<motion.button
        type="button"
        className="heart-wrap"
        onClick={tapHeart}
        disabled={!mainDone}
        aria-label={mainDone ? 'Сердце' : undefined}
        animate={wiggle ? { rotate: [0, -8, 8, -6, 6, 0], scale: 1.06 } : {}}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: wiggle ? 0.7 : 0.45 }}
        style={{
          background: 'none',
          border: 'none',
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          padding: 18,
          borderRadius: '50%',
        }}
      >
        <span className="heart-glow" />
        <motion.span
          key={`heart-tap-${taps}`}
          className="heart-jiggle"
          initial={taps > 0 ? { rotate: -10, scale: 1.14 } : { rotate: 0, scale: 1 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 12 }}
        >
          <svg className="heart-svg" width="150" height="136" viewBox="0 0 32 30" aria-hidden>
            <defs>
              <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff9ec7" />
                <stop offset="55%" stopColor="#d4527a" />
                <stop offset="100%" stopColor="#8b3a5e" />
              </linearGradient>
            </defs>
            <path d={HEART_SVG} fill="url(#hg)" />
            <path
              d={HEART_SVG}
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="0.7"
              opacity="0.55"
            />
          </svg>
        </motion.span>
      </motion.button>

      <p className="heart-tap-hint">
        {mainDone ? (hintIdx !== null ? heartTapHints[hintIdx] : 'нажми на него') : ''}
      </p>

      <AnimatePresence>
        {ready && (
          <motion.button
            type="button"
            className="btn btn-ghost"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => onNext('letter')}
          >
            дальше
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
