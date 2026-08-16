import { motion } from 'framer-motion'

interface MusicButtonProps {
  started: boolean
  playing: boolean
  onToggle: () => void
}

export function MusicButton({ started, playing, onToggle }: MusicButtonProps) {
  const label = !started ? '✨ включить атмосферу' : playing ? '🔊' : '🔇'

  return (
    <button
      type="button"
      className={`music-btn${!started ? ' music-intro' : ''}`}
      onClick={onToggle}
      title={label}
      aria-label={label}
      style={{ borderRadius: !started ? 999 : undefined }}
    >
      <motion.span
        key={label}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {label}
      </motion.span>
    </button>
  )
}
