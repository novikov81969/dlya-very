import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { music } from './audio/ambientMusic'
import { Background } from './components/Background'
import { MusicButton } from './components/MusicButton'
import { CoffeeScene } from './components/scenes/CoffeeScene'
import { CinemaScene } from './components/scenes/CinemaScene'
import { FinalScene } from './components/scenes/FinalScene'
import { HeartScene } from './components/scenes/HeartScene'
import { IntroScene } from './components/scenes/IntroScene'
import { LetterScene } from './components/scenes/LetterScene'
import { MemoryScene } from './components/scenes/MemoryScene'
import { closeFallback } from './data/finale'
import { useIdle } from './hooks/useIdle'
import type { SceneId } from './types'

const IDLE_LINES: Record<SceneId, string> = {
  intro: 'Ты там ещё со мной? 😌',
  memory: 'Я подожду. Тут уютно.',
  coffee: 'Не спеши, я никуда не тороплюсь.',
  cinema: 'Выбор непростой, я понимаю.',
  heart: 'Ты всё ещё тут?.. Я рад.',
  letter: 'Спокойно. Это твоё решение — и любое из них хорошее.',
  finale: 'Я всё ещё тут. И, кажется, никуда не денусь.',
}

const SCENE_IDS: SceneId[] = ['intro', 'memory', 'coffee', 'cinema', 'heart', 'letter', 'finale']

function initialSceneFromHash(): SceneId {
  const m = window.location.hash.match(/scene=([\w-]+)/)
  const hit = m && (SCENE_IDS as string[]).includes(m[1])
  return hit ? (m![1] as SceneId) : 'intro'
}

export default function App() {
  const [scene, setScene] = useState<SceneId>(initialSceneFromHash)
  const [run, setRun] = useState(0)
  const [musicStarted, setMusicStarted] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [closeToast, setCloseToast] = useState(false)
  const idle = useIdle(45000)

  const go = (next: SceneId) => {
    window.scrollTo(0, 0)
    setScene(next)
  }

  const restart = () => {
    go('intro')
    setRun((r) => r + 1)
  }

  const tryClose = () => {
    window.close()
    setCloseToast(true)
  }

  const toggleMusic = () => {
    if (music.playing) {
      music.stop()
      setMusicPlaying(false)
    } else {
      music.start()
      setMusicStarted(true)
      setMusicPlaying(true)
    }
  }

  const scenes: Record<SceneId, JSX.Element> = {
    intro: <IntroScene onNext={go} />,
    memory: <MemoryScene onNext={go} />,
    coffee: <CoffeeScene onNext={go} />,
    cinema: <CinemaScene onNext={go} />,
    heart: <HeartScene onNext={go} />,
    letter: <LetterScene onNext={go} />,
    finale: (
      <FinalScene onNext={restart} onClose={tryClose} onFinish={() => setCloseToast(true)} />
    ),
  }

  return (
    <>
      <Background />
      <MusicButton started={musicStarted} playing={musicPlaying} onToggle={toggleMusic} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${scene}-${run}`}
          className="stage"
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {scenes[scene]}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
{idle && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 16, x: '-50%' }}
            transition={{ duration: 0.45 }}
          >
            {IDLE_LINES[scene]}
          </motion.div>
        )}
        {closeToast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 16, x: '-50%' }}
            transition={{ duration: 0.45 }}
          >
            {closeFallback}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
