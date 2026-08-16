/* Генеративная, спокойная фоновая музыка через Web Audio API.
   Без внешних файлов и авторских прав — мягкие подушечки-аккорды
   и редкие «звёздные» переливы. Громкость сознательно низкая. */

type AnyWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

const CHORDS: number[][] = [
  [220.0, 261.63, 329.63], // A m
  [174.61, 220.0, 261.63], // F
  [261.63, 329.63, 392.0], // C
  [196.0, 246.94, 293.66], // G
]

const SPARKLES = [659.25, 783.99, 880.0, 1046.5]

const CHORD_LENGTH = 8
const FADE = 3.2
const SPARKLE_MIN = 2200
const SPARKLE_MAX = 4600

class AmbientMusic {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private chordTimer: number | null = null
  private sparkleTimer: number | null = null
  private activeNodes: OscillatorNode[] = []
  private chordIndex = 0
  private _playing = false

  get playing() {
    return this._playing
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx
    const w = window as AnyWindow
    const Ctor = window.AudioContext ?? w.webkitAudioContext
    if (!Ctor) return null
    const ctx = new Ctor()

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    this.ctx = ctx
    this.master = master
    return ctx
  }

  start() {
    const ctx = this.ensureContext()
    if (!ctx || this._playing) return

if (ctx.state === 'suspended') void ctx.resume()
    const fadeS = FADE
    const vol = this.master?.gain
    if (vol) {
      vol.cancelScheduledValues(ctx.currentTime)
      vol.setValueAtTime(0.0001, ctx.currentTime)
      vol.exponentialRampToValueAtTime(0.55, ctx.currentTime + fadeS)
    }

    this._playing = true
    this.chordIndex = 0
    this.playChord(ctx, this.chordIndex, ctx.currentTime + 0.15)

    this.chordTimer = window.setInterval(() => {
      this.chordIndex = (this.chordIndex + 1) % CHORDS.length
      const now = ctx.currentTime
      this.playChord(ctx, this.chordIndex, Math.max(now + 0.05, now))
    }, CHORD_LENGTH * 1000)

    this.scheduleSparkle(ctx)
  }

  private playChord(ctx: AudioContext, index: number, at: number) {
    const freqs = CHORDS[index] ?? CHORDS[0]
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(950, at)
    filter.Q.value = 0.6

    const wet = ctx.createGain()
    wet.gain.value = 0.22
    const delay = ctx.createDelay(1.2)
    delay.delayTime.value = 0.42
    const feedback = ctx.createGain()
    feedback.gain.value = 0.34
    const damp = ctx.createBiquadFilter()
    damp.type = 'lowpass'
    damp.frequency.value = 1400

    delay.connect(damp)
    damp.connect(feedback)
    feedback.connect(delay)
    damp.connect(wet)
    wet.connect(this.master as GainNode)

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const note = ctx.createGain()
      const pan = ctx.createStereoPanner()
      pan.pan.value = i === 0 ? -0.15 : i === 1 ? 0.2 : 0.05

      osc.type = 'sine'
      osc.frequency.value = f
      osc.detune.value = (i - 1) * 4

      const amp = i === 0 ? 0.14 : 0.1
      note.gain.setValueAtTime(0.0001, at)
      note.gain.exponentialRampToValueAtTime(amp, at + FADE * 0.75)
      note.gain.exponentialRampToValueAtTime(0.0001, at + CHORD_LENGTH + 1.2)

      osc.connect(note)
      note.connect(filter)
      note.connect(delay)
      filter.connect(pan)
      pan.connect(this.master as GainNode)

      osc.start(at)
      osc.stop(at + CHORD_LENGTH + 2.2)
      this.activeNodes.push(osc)
    })
  }

  private scheduleSparkle(ctx: AudioContext) {
    const play = () => {
      if (!this._playing || !this.ctx) return
      const f = SPARKLES[Math.floor(Math.random() * SPARKLES.length)]
      const at = ctx.currentTime + 0.02
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 3000

      osc.type = 'sine'
      osc.frequency.value = f
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(0.045, at + 0.05)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.1)

      osc.connect(g)
      g.connect(hp)
      hp.connect(this.master as GainNode)
      osc.start(at)
      osc.stop(at + 1.3)
      this.activeNodes.push(osc)
    }

    const loop = () => {
      if (!this._playing) return
      play()
      this.sparkleTimer = window.setTimeout(
        loop,
        SPARKLE_MIN + Math.random() * (SPARKLE_MAX - SPARKLE_MIN),
      )
    }
    this.sparkleTimer = window.setTimeout(loop, 1800)
  }

  stop() {
    if (!this.ctx || !this._playing) return
    this._playing = false

    const ctx = this.ctx
    const now = ctx.currentTime
    if (this.master) {
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setValueAtTime(this.master.gain.value, now)
      this.master.gain.linearRampToValueAtTime(0.0001, now + 0.6)
    }
    this.activeNodes.forEach((o) => {
      try {
        o.onended = () => {
          try {
            o.disconnect()
          } catch {
            /* noop */
          }
        }
      } catch {
        /* noop */
      }
    })
    this.activeNodes = []

    if (this.chordTimer !== null) {
      window.clearInterval(this.chordTimer)
      this.chordTimer = null
    }
    if (this.sparkleTimer !== null) {
      window.clearTimeout(this.sparkleTimer)
      this.sparkleTimer = null
    }
  }
}

export const music = new AmbientMusic()
