import { useEffect, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import Hero from '@/components/Hero'
import Intro from '@/components/Intro'
import Notice from '@/components/Notice'

const FADE_MS = 1000
const DISCLAIMER_HOLD_MS = 4000 // visible time after fade-in, before fade-out starts
const NOTICE_HOLD_MS = 6000

type Screen = 'intro' | 'disclaimer' | 'disclaimerOut' | 'notice' | 'noticeOut' | 'hero'

// After each timed screen: how long it stays, then which screen follows
const NEXT: Partial<Record<Screen, [number, Screen]>> = {
  disclaimer: [FADE_MS + DISCLAIMER_HOLD_MS, 'disclaimerOut'],
  disclaimerOut: [FADE_MS, 'notice'],
  notice: [FADE_MS + NOTICE_HOLD_MS, 'noticeOut'],
  noticeOut: [FADE_MS, 'hero'],
}

// Dev shortcut: /?screen=hero jumps straight to a screen
const startScreen = (): Screen => {
  const requested = import.meta.env.DEV && new URLSearchParams(location.search).get('screen')
  return requested && ['disclaimer', 'notice', 'hero'].includes(requested) ? (requested as Screen) : 'intro'
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(startScreen)

  useEffect(() => {
    const step = NEXT[screen]
    if (!step) return
    const id = setTimeout(() => setScreen(step[1]), step[0])
    return () => clearTimeout(id)
  }, [screen])

  switch (screen) {
    case 'intro':
      return <Intro onDone={() => setScreen('disclaimer')} />
    case 'disclaimer':
    case 'disclaimerOut':
      return (
        <div className={screen === 'disclaimerOut' ? 'fade-out' : 'fade-in'}>
          <Disclaimer />
        </div>
      )
    case 'notice':
    case 'noticeOut':
      return (
        <div className={screen === 'noticeOut' ? 'fade-out' : 'fade-in'}>
          <Notice />
        </div>
      )
    case 'hero':
      return (
        <div className="fade-in">
          <Hero />
        </div>
      )
  }
}
