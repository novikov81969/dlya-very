/** Фон: градиент, светящиеся пятна и парящие частицы. */
import { useMemo } from 'react'
import type { CSSProperties } from 'react'

interface Particle {
  left: number
  size: number
  duration: number
  delay: number
  opacity: number
  drift: number
}

export function Background() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 16 }, () => ({
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 18 + Math.random() * 24,
      delay: -Math.random() * 30,
      opacity: 0.25 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 12,
    }))
  }, [])

  return (
    <>
      <div className="bg" />
      <div className="blobs" aria-hidden>
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
      </div>
      <div className="particles" aria-hidden>
{particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={
              {
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--p-op': p.opacity,
                '--p-x': `${p.drift}vmin`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  )
}
