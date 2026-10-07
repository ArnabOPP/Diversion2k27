import { useEffect, useState } from 'react'
import About from '@/components/About'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Schedule from '@/components/Schedule'
import ScrubVideo from '@/components/ScrubVideo'
import Visit from '@/components/Visit'
import ScrollVideo from '@/components/ScrollVideo'
import Start from '@/components/Start'

const START_HOLD_MS = 5000
const FADE_MS = 2000

type Screen = 'start' | 'startOut' | 'hero'

// After each timed screen: how long it stays, then which screen follows
const NEXT: Partial<Record<Screen, [number, Screen]>> = {
  start: [START_HOLD_MS, 'startOut'],
  startOut: [FADE_MS, 'hero'],
}

// Dev shortcut: /?screen=hero jumps straight to a screen
const startScreen = (): Screen => {
  const requested = import.meta.env.DEV && new URLSearchParams(location.search).get('screen')
  return requested && ['hero'].includes(requested) ? (requested as Screen) : 'start'
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(startScreen)

  useEffect(() => {
    const step = NEXT[screen]
    if (!step) return
    const id = setTimeout(() => setScreen(step[1]), step[0])
    return () => clearTimeout(id)
  }, [screen])

  // The incoming screen starts scaled up, which would add scrollbars mid-transition; lock scrolling until it ends
  useEffect(() => {
    if (screen !== 'startOut') return
    document.documentElement.classList.add('no-scroll')
    const id = setTimeout(() => document.documentElement.classList.remove('no-scroll'), FADE_MS)
    return () => {
      clearTimeout(id)
      document.documentElement.classList.remove('no-scroll')
    }
  }, [screen])

  // Hero stays mounted (hidden) behind the start page so its images are loaded before the transition
  const isStart = screen === 'start'
  return (
    <>
      <div className={isStart ? 'hero-wait' : 'zoom-in'}>
        <ScrollVideo>
          <Hero />
        </ScrollVideo>
        <About />
        <ScrubVideo src="/video%203%20scrub.mp4" />
        <About id="about-2" last />
        <Visit />
        <ScrubVideo src="/video%204%20scrub.mp4" />
        <Schedule />
        <Visit id="visit-2" after="schedule" />
        <Header />
      </div>
      {isStart ? (
        <Start />
      ) : screen === 'startOut' ? (
        <div className="zoom-out">
          <Start />
        </div>
      ) : null}
    </>
  )
}
