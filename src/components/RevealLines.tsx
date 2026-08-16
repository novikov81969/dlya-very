import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface RevealLinesProps {
  lines: readonly string[]
  gap?: number
  startAfter?: number
  onDone?: () => void
  className?: string
  lineClassName?: string
}

/** Последовательно показывает строки с мягким появлением. */
export function RevealLines({
  lines,
  gap = 1150,
  startAfter = 500,
  onDone,
  className,
  lineClassName,
}: RevealLinesProps) {
  const [shown, setShown] = useState(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (shown >= lines.length) return
    const timer = window.setTimeout(
      () => setShown((s) => s + 1),
      shown === 0 ? startAfter : gap,
    )
    return () => window.clearTimeout(timer)
  }, [shown, lines.length, gap, startAfter])

  useEffect(() => {
    if (shown >= lines.length) onDoneRef.current?.()
  }, [shown, lines.length])

  return (
    <div className={className}>
      <AnimatePresence>
        {lines.slice(0, shown).map((line, i) => (
          <motion.p
            key={i}
            className={lineClassName}
            initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          >
            {line}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  )
}
