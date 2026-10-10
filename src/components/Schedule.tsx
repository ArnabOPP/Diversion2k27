import { useEffect, useRef, useState } from 'react'
import { Lightbox } from './About'
import './Schedule.css'

const asset = (name: string) => encodeURI(`/${name}`)

// Placeholder gallery. Layout is generated from a repeating set of "groups" (a group is one column of the gallery):
// x/w/h are in vh, y is % of the screen height, dx is the tile's offset inside its group, gap is the space after the group.
type Tile = { dx: number; y: number; w: number; h: number }
type Group = { tiles: Tile[]; width: number; gap: number }

const GROUPS: Record<string, Group> = {
  // a large tile with a smaller one above its right edge (cards 2, 10 and 18)
  pair: { tiles: [{ dx: 0, y: 44, w: 66, h: 52 }, { dx: 26, y: 0, w: 40, h: 40 }], width: 66, gap: 3 },
  tall: { tiles: [{ dx: 0, y: 12, w: 43, h: 76 }], width: 43, gap: 13 },
  bleed: { tiles: [{ dx: 0, y: 0, w: 57, h: 100 }], width: 57, gap: 3 },
  square: { tiles: [{ dx: 0, y: 17, w: 66, h: 66 }], width: 66, gap: 13 },
  narrow: { tiles: [{ dx: 0, y: 6, w: 50, h: 88 }], width: 50, gap: 5 }, // cards 6 and 14 (gap after = space left of cards 7 and 15)
  medium: { tiles: [{ dx: 0, y: 28, w: 70, h: 70 }], width: 70, gap: 5 }, // cards 7 and 15: bigger and lower (gap after = space right of them)
  wide: { tiles: [{ dx: 0, y: 0, w: 102, h: 100 }], width: 102, gap: 0 },
}

// 22 cards: pair(2) + tall + bleed + square + narrow + medium + wide = 8, twice, then pair + tall + bleed + square + wide
const SEQUENCE = [
  ...['pair', 'tall', 'bleed', 'square', 'narrow', 'medium', 'wide'],
  ...['pair', 'tall', 'bleed', 'square', 'narrow', 'medium', 'wide'],
  ...['pair', 'tall', 'bleed', 'square', 'wide'],
]

const FILES = [
  'Scroll Down (12).png',
  'Scroll Down (14).png',
  'Scroll Down (13).png',
  'about 2.png',
  'about 1.png',
  'about 3.png',
  'Scroll Down (15).png',
  'hero bg.png',
]

const GALLERY_GAP = 13 // space (vh) between the last gap-less group and the next, and before the end

const { PHOTOS, GALLERY_VH } = (() => {
  const photos: { num: number; file: string; alt: string; x: number; y: number; w: number; h: number }[] = []
  let x = -36 // the first card starts left of the gallery origin, so a sliver of it shows at the screen's right edge
  SEQUENCE.forEach((name) => {
    const group = GROUPS[name]
    group.tiles.forEach((tile) => {
      const num = photos.length + 1
      photos.push({
        num,
        file: FILES[(num - 1) % FILES.length],
        alt: `Placeholder photo ${num}`,
        x: x + tile.dx,
        y: tile.y,
        w: tile.w,
        h: tile.h,
      })
    })
    x += group.width + (name === 'wide' ? GALLERY_GAP : group.gap)
  })
  // the gallery's last card should end flush with the screen's right edge
  return { PHOTOS: photos, GALLERY_VH: x - GALLERY_GAP }
})()

const SMOOTHING = 0.12 // 0-1: how quickly the gallery catches up with the scroll position
const SPEED = 1.5 // sideways pixels moved per pixel of vertical scroll (1 = same speed; higher = shorter scroll)

// Contact variant: four cards instead of photos (details are placeholders until the real ones are known)
const CONTACTS = [
  { kind: 'call', title: 'Call us', detail: '+91 00000 00000', action: 'Call now' },
  { kind: 'mail', title: 'Mail us', detail: 'team@example.com', action: 'Send a mail' },
  { kind: 'discord', title: 'Discord', detail: 'discord.gg/your-invite', action: 'Join the server' },
]
const CONTACT_W = 52 // card size in vh
const CONTACT_H = 64
const CONTACT_GAP = 8
const CONTACT_START = -20 // the first card starts left of the gallery origin so a sliver shows at the right edge
const CONTACT_END_PAD = 10 // space (vh) left to the right of the last card at the end of the scroll
const CONTACT_GALLERY_VH =
  CONTACT_START + CONTACTS.length * CONTACT_W + (CONTACTS.length - 1) * CONTACT_GAP + CONTACT_END_PAD

// Text around the gallery for each use of this section
const COPY = {
  schedule: {
    script: 'Schedule',
    title: ['THE FULL', 'SCHEDULE'],
    subtitle: 'TWO DAYS, ONE CAMPUS, ENDLESS IDEAS.',
    body: 'Placeholder text for the Diversion 2K27 schedule. The opening ceremony, hacking hours, mentor rounds, demos and the closing ceremony will be listed here, hour by hour, so every team knows exactly what is coming next.',
    brand: ['VISIT', 'DIVERSION'],
    backTo: 'visit',
  },
  contact: {
    script: 'Say Hello',
    title: ['GET IN', 'TOUCH'],
    subtitle: 'WE WOULD LOVE TO HEAR FROM YOU.',
    body: 'Questions, ideas or want to partner with us? Reach out through any of the channels that follow and the team will get back to you.',
    brand: ['CONTACT', 'DIVERSION'],
    backTo: 'faq',
  },
}

function ContactIcon({ kind }: { kind: string }) {
  const common = { width: 34, height: 34, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (kind) {
    case 'call':
      return (
        <svg {...common} aria-hidden>
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      )
    case 'discord':
      return (
        <svg {...common} aria-hidden>
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 21 12z" />
          <path d="M9 11.5h.01M15 11.5h.01" />
        </svg>
      )
    default:
      return (
        <svg {...common} aria-hidden>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      )
  }
}

interface ScheduleProps {
  id?: string
  variant?: 'schedule' | 'contact'
}

export default function Schedule({ id = 'schedule', variant = 'schedule' }: ScheduleProps) {
  const contact = variant === 'contact'
  const copy = COPY[variant]
  const galleryVh = contact ? CONTACT_GALLERY_VH : GALLERY_VH
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  // Vertical scroll through the tall section slides the track sideways (1px of scroll = 1px of travel)
  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const movers = track.querySelectorAll<HTMLElement>('.schedule__intro, .schedule__photo, .schedule__contact')
    let current: number | null = null
    let frame = 0

    const tick = () => {
      const range = section.offsetHeight - window.innerHeight
      const target = Math.min(range, Math.max(0, -section.getBoundingClientRect().top))
      current = current === null ? target : current + (target - current) * SMOOTHING
      // Move each piece on its own instead of one very wide track: a single layer that wide can exceed the
      // browser's maximum texture size, and everything past that point stops being drawn
      const shift = `translate3d(${-current * SPEED}px, 0, 0)`
      movers.forEach((el) => (el.style.transform = shift))
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const goBack = () => document.getElementById(copy.backTo)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`schedule${contact ? ' schedule--contact' : ''}`}
      style={{ height: `calc(100vh + (12vw + ${galleryVh}vh) / ${SPEED})` }}
    >
      <div className="schedule__stage">
        <button className="schedule__back" type="button" onClick={goBack}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M15 9H3M8.5 3.5L3 9l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <div ref={trackRef} className="schedule__track" style={{ width: `calc(112vw + ${galleryVh}vh)` }}>
          <div className="schedule__intro">
            <figure className="schedule__card">
              <img src={asset('Scroll Down (15).png')} alt="Placeholder postcard" />
              <p className="schedule__script">{copy.script}</p>
              <div className="schedule__brand">
                <span>{copy.brand[0]}</span>
                <span>{copy.brand[1]}</span>
              </div>
            </figure>

            <div className="schedule__text">
              <h2>
                {copy.title[0]}
                <br />
                {copy.title[1]}
              </h2>
              <h3>{copy.subtitle}</h3>
              <p>{copy.body}</p>
            </div>
          </div>

          <div className="schedule__gallery">
            {contact
              ? CONTACTS.map((c, i) => (
                  <div
                    key={c.kind}
                    className="schedule__contact"
                    style={{
                      left: `${CONTACT_START + i * (CONTACT_W + CONTACT_GAP)}vh`,
                      top: '18%',
                      width: `${CONTACT_W}vh`,
                      height: `${CONTACT_H}vh`,
                    }}
                  >
                    <span className="schedule__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="schedule__contact-icon">
                      <ContactIcon kind={c.kind} />
                    </div>
                    <h4>{c.title}</h4>
                    <div className="schedule__contact-row">
                      <button type="button">{c.action}</button>
                      <p>{c.detail}</p>
                    </div>
                  </div>
                ))
              : PHOTOS.map((p) => (
                  <div
                    key={p.file}
                    className="schedule__photo"
                    style={{ left: `${p.x}vh`, top: `${p.y}%`, width: `${p.w}vh`, height: `${p.h}vh` }}
                    onClick={() => setLightbox({ src: asset(p.file), alt: p.alt })}
                  >
                    <img src={asset(p.file)} alt={p.alt} />
                    <span className="schedule__num" aria-hidden="true">
                      {String(p.num).padStart(2, '0')}
                    </span>
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
