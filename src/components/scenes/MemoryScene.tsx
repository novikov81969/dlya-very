import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { hiddenNote, memoryDone, memoryHint, memoryItems, memoryKicker } from '../../data/memory'
import { RevealLines } from '../RevealLines'
import type { SceneProps } from '../../types'

export function MemoryScene({ onNext }: SceneProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [found, setFound] = useState<string[]>([])
  const [noteFound, setNoteFound] = useState(false)
  const [ready, setReady] = useState(false)

  const total = memoryItems.length
  const allFoundAny = found.length >= total

  const pick = (id: string) => {
    setSelected(id)
    if (!found.includes(id)) setFound((f) => [...f, id])
  }

  const selectedItem = selected ? memoryItems.find((i) => i.id === selected) : undefined

  return (
    <div className="scene">
      <motion.p className="kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        {memoryKicker}
      </motion.p>

      <RevealLines
        lines={['Всё это было. Нажимай на предметы — они расскажут сами.']}
        gap={300}
        startAfter={300}
        lineClassName="line line-dim"
      />

      <div className="grid-items">
        {memoryItems.map((item, i) => (
          <motion.button
            type="button"
            key={item.id}
            className={`item-chip glass${found.includes(item.id) ? ' found' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.12 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => pick(item.id)}
          >
            <span className="item-icon">{item.icon}</span>
            <span className="item-label">{item.label}</span>
          </motion.button>
        ))}
      </div>

      <motion.button
        type="button"
        className="hidden-spark"
        whileTap={{ scale: 0.9 }}
        onClick={() => setNoteFound(true)}
        aria-label="Что-то ещё…"
        title="Что-то ещё…"
      >
        ✨
      </motion.button>

      <AnimatePresence mode="wait">
        {noteFound ? (
          <motion.div
            key="note"
            className="quote-panel glass"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <RevealLines lines={hiddenNote} gap={1000} startAfter={200} lineClassName="line" />
          </motion.div>
        ) : selectedItem && !allFoundAny ? (
          <motion.div
            key={selectedItem.id}
            className="quote-panel glass"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <p>{selectedItem.line}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {allFoundAny && (
          <motion.div
            key="done"
            className="glass quote-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <RevealLines lines={memoryDone} gap={1300} startAfter={300} lineClassName="line" onDone={() => setReady(true)} />
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
            onClick={() => onNext('coffee')}
          >
            дальше
          </motion.button>
        )}
      </AnimatePresence>

      {allFoundAny && <motion.p style={{ fontSize: 13, color: 'var(--muted)' }}>{memoryHint}</motion.p>}
    </div>
  )
}
