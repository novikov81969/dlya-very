import { useEffect, useRef, useState } from 'react'

const EVENTS: (keyof WindowEventMap)[] = [
  'pointerdown',
  'pointermove',
  'touchstart',
  'keydown',
  'scroll',
  'wheel',
]

/** Возвращает true, если пользователь бездействовал больше thresholdMs. */
export function useIdle(thresholdMs = 42000): boolean {
  const [idle, setIdle] = useState(false)
  const last = useRef(Date.now())

  useEffect(() => {
    const bump = () => {
      last.current = Date.now()
      setIdle(false)
    }
    EVENTS.forEach((e) => window.addEventListener(e, bump, { passive: true }))

    const timer = window.setInterval(() => {
      if (Date.now() - last.current > thresholdMs) setIdle(true)
    }, 4000)

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, bump))
      window.clearInterval(timer)
    }
  }, [thresholdMs])

  return idle
}
