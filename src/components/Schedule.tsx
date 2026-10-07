import { useEffect, useRef, useState } from 'react'
import { Lightbox } from './About'
import './Schedule.css'

const asset = (name: string) => encodeURI(`/${name}`)

// Placeholder gallery: x and sizes are in vh (x measured from the start of the gallery), y is % of the screen height
const PHOTOS = [
  { file: 'Scroll Down (14).png', alt: 'Placeholder photo 1', x: 0, y: 0, w: 30, h: 30 },
  { file: 'Scroll Down (12).png', alt: 'Placeholder photo 2', x: -36, y: 44, w: 66, h: 52 },
  { file: 'Scroll Down (13).png', alt: 'Placeholder photo 3', x: 33, y: 12, w: 43, h: 76 },
  { file: 'about 2.png', alt: 'Placeholder photo 4', x: 89, y: 0, w: 57, h: 100 },
  { file: 'about 1.png', alt: 'Placeholder photo 5', x: 149, y: 17, w: 66, h: 66 },
  { file: 'about 3.png', alt: 'Placeholder photo 6', x: 228, y: 12, w: 42, h: 76 },
  { file: 'Scroll Down (15).png', alt: 'Placeholder photo 7', x: 284, y: 19, w: 60, h: 60 },
  { file: 'hero bg.png', alt: 'Placeholder photo 8', x: 357, y: 0, w: 102, h: 100 },
]

const SMOOTHING = 0.12 // 0-1: how quickly the gallery catches up with the scroll position

export default function Schedule() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  // Vertical scroll through the tall section slides the track sideways (1px of scroll = 1px of travel)
  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    let current: number | null = null
    let frame = 0

    const tick = () => {
      const range = section.offsetHeight - window.innerHeight
      const target = Math.min(range, Math.max(0, -section.getBoundingClientRect().top))
      current = current === null ? target : current + (target - current) * SMOOTHING
      track.style.transform = `translate3d(${-current}px, 0, 0)`
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const goBack = () => document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section ref={sectionRef} id="schedule" className="schedule">
      <div className="schedule__stage">
        <button className="schedule__back" type="button" onClick={goBack}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M15 9H3M8.5 3.5L3 9l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <div ref={trackRef} className="schedule__track">
          <div className="schedule__intro">
            <figure className="schedule__card">
              <img src={asset('Scroll Down (15).png')} alt="Placeholder postcard" />
              <p className="schedule__script">Schedule</p>
              <div className="schedule__brand">
                <span>VISIT</span>
                <span>DIVERSION</span>
              </div>
            </figure>

            <div className="schedule__text">
              <h2>
                THE FULL
                <br />
                SCHEDULE
              </h2>
              <h3>TWO DAYS, ONE CAMPUS, ENDLESS IDEAS.</h3>
              <p>
                Placeholder text for the Diversion 2K27 schedule. The opening ceremony, hacking hours, mentor rounds, demos and
                the closing ceremony will be listed here, hour by hour, so every team knows exactly what is coming next.
              </p>
            </div>
          </div>

          <div className="schedule__gallery">
            {PHOTOS.map((p) => (
              <div
                key={p.file}
                className="schedule__photo"
                style={{ left: `${p.x}vh`, top: `${p.y}%`, width: `${p.w}vh`, height: `${p.h}vh` }}
                onClick={() => setLightbox({ src: asset(p.file), alt: p.alt })}
              >
                <img src={asset(p.file)} alt={p.alt} />
                <button className="schedule__open" type="button" aria-label={`Open photo: ${p.alt}`}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <path
                      d="M10.5 2H16v5.5M7.5 16H2v-5.5M16 2l-5.5 5.5M2 16l5.5-5.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}
    </section>
  )
}
