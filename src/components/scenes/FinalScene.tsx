import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import {
  finaleClose,
  finaleEnd,
  finaleMain,
  finaleMore,
  finaleMoreButton,
  finaleRestart,
} from '../../data/finale'
import { RevealLines } from '../RevealLines'
import { aggregate, getStats, resetStats } from '../../stats'
import type { StatsState } from '../../stats'

interface FinalSceneProps {
  onNext: () => void
  onClose: () => void
  onFinish: () => void
}

export function FinalScene({ onNext, onClose, onFinish }: FinalSceneProps) {
  const [mainDone, setMainDone] = useState(false)
  const [moreShown, setMoreShown] = useState(false)
  const [endShown, setEndShown] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [report, setReport] = useState<StatsState | null>(null)

  const openReport = () => {
    setReport(getStats())
    setReportOpen((o) => !o)
  }

  const restartGame = () => {
    resetStats()
    onNext()
  }

  return (
    <>
      <motion.div
        className="finale-glow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 0.4 }}
      />
      <div className="scene">
        <RevealLines
          lines={finaleMain}
          gap={1500}
          startAfter={900}
          lineClassName="line"
          onDone={() => setMainDone(true)}
        />

        <AnimatePresence>
          {mainDone && !moreShown && (
            <motion.button
              type="button"
              className="btn btn-ghost btn-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => setMoreShown(true)}
            >
              {finaleMoreButton}
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {moreShown && (
            <motion.div
              className="scene"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="glass quote-panel">
                <RevealLines
                  lines={finaleMore}
                  gap={1600}
                  startAfter={300}
                  lineClassName="line"
                  onDone={() => setEndShown(true)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {endShown && (
            <motion.div className="scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
              <motion.p
                className="big-ask"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1 }}
                style={{ margin: '0.4em 0' }}
              >
                {finaleEnd}
              </motion.p>

<div className="row" style={{ marginTop: 8 }}>
                <motion.button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  whileTap={{ scale: 0.96 }}
                  onClick={restartGame}
                >
                  {finaleRestart}
                </motion.button>
                <motion.button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    onClose()
                    onFinish()
                  }}
                >
                  {finaleClose}
                </motion.button>
              </div>

              <AnimatePresence>
                {reportOpen && report && (() => {
                  const agg = aggregate(report)
                  return (
                    <motion.div
                      className="glass report-panel"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="report-title">
                        Ξ · Всего кликов: <b>{agg.total}</b>
                        {report.choice ? ' · Выбор: ' + report.choice : ''}
                      </div>
                      {agg.groups.map((g) => (
                        <div key={g.scene} className="report-group">
                          <div className="report-scene">{g.scene}</div>
                          {g.items.map((it) => (
                            <div key={g.scene + it.label} className="report-line">
                              <span>{it.label}</span>
                              <b>{it.count}</b>
                            </div>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  )
                })()}
              </AnimatePresence>

              {endShown && (
                <motion.button
                  type="button"
                  className="btn btn-ghost btn-sm report-toggle"
                  whileTap={{ scale: 0.96 }}
                  onClick={openReport}
                >
                  {reportOpen ? 'свернуть отчёт' : 'показать отчёт'}
                </motion.button>
              )}

              <motion.p
                style={{ marginTop: 18, fontSize: 12, letterSpacing: '0.28em', color: 'var(--muted)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 1 }}
              >
                ★ ★ ★
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
