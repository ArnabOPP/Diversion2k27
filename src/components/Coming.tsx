import { useEffect, useRef } from 'react'
import './About.css' // shares the section background and the slide-over
import './Coming.css'
import Footer from './Footer'

// Closing "coming soon" screen: logo, COMING SOON, and Stay tuned for more
const HOLD_START = 0.25 // share of the pinned scroll spent standing still before it starts to shrink
const SHRINK_SPAN = 0.55 // share spent shrinking; the rest is a short hold before it scrolls away
const MIN_SCALE = 0.95 // how small the block gets (1 = no shrink)

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

interface ComingProps {
  id?: string
}

export default function Coming({ id = 'coming' }: ComingProps) {
  const pinRef = useRef<HTMLDivElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)

  // The block arrives with the scroll, stops (the stage is pinned), shrinks a little, then scrolls away
  useEffect(() => {
    const pin = pinRef.current
    const block = blockRef.current
    if (!pin || !block) return

    let frame = 0
    const tick = () => {
      const range = pin.offsetHeight - window.innerHeight
      const progress = range > 0 ? clamp(-pin.getBoundingClientRect().top / range) : 0
      const shrink = ease(clamp((progress - HOLD_START) / SHRINK_SPAN))
      block.style.transform = `scale(${1 - (1 - MIN_SCALE) * shrink})`
      block.style.setProperty('--coming-shift', `${clamp(progress) * 100}%`)
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section id={id} className="about about--last coming">
      <div ref={pinRef} className="coming__pin">
        <div className="coming__stage">
          <div ref={blockRef} className="coming__block">
            <img className="coming__logo" src="/diversion%206%20logo.png" alt="Diversion 2K27" />

            <h2 className="coming__text" aria-label="COMING SOON">
              <span className="coming__line">COMING SOON</span>
            </h2>

            <p className="coming__sub">Stay tuned for more...</p>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  )
}
