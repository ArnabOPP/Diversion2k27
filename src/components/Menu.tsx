import { useEffect, useState } from 'react'
import './Menu.css'

// Each option scrolls to a real section of the page (`target` is its element id; Home has none and goes to the top)
const ITEMS: { label: string; target: string | null }[] = [
  { label: 'Home', target: null },
  { label: 'About', target: 'about' },
  { label: 'Venue', target: 'about-2' },
  { label: 'Schedule', target: 'schedule' },
  { label: 'Partners', target: 'about-4' },
  { label: 'Prizes', target: 'visit-4' },
  { label: 'FAQ', target: 'faq' },
  { label: 'Contact', target: 'contact' },
]

// The option for the section the visitor is currently in: of the sections whose top is above the middle of the
// screen, the one that starts furthest down the page
function currentIndex(): number {
  const line = window.scrollY + window.innerHeight * 0.4
  let found = 0
  let foundTop = -1
  ITEMS.forEach((item, i) => {
    if (!item.target) return
    const el = document.getElementById(item.target)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    if (top <= line && top > foundTop) {
      found = i
      foundTop = top
    }
  })
  return found
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function Menu({ open, onClose }: Props) {
  const [active, setActive] = useState(0)

  // Lock page scroll and close on Escape while the menu is open; highlight the current section
  useEffect(() => {
    if (!open) return
    setActive(currentIndex())
    document.documentElement.classList.add('no-scroll')
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.classList.remove('no-scroll')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const go = (target: string | null) => (e: React.MouseEvent) => {
    e.preventDefault()
    onClose()
    // wait a moment so the scroll lock is released before scrolling
    window.setTimeout(() => {
      if (!target) window.scrollTo({ top: 0, behavior: 'smooth' })
      else document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  return (
    <div className={`menu${open ? ' menu--open' : ''}`} aria-hidden={!open}>
      <div className="menu__backdrop" />
      <div className="menu__stage" onClick={onClose}>
        <img className="menu__logo" src="/diversion%206%20logo.png" alt="Diversion 2K27" />
        <div className="menu__foot">
          <p>
            KOLKATA
            <br />
            2027
          </p>
        </div>
      </div>

      <nav className="menu__panel" aria-label="Main menu">
        <div className="menu__head">
          <img src="/diversion%20logo.png" alt="" />
          <span className="menu__sep" />
          <span className="menu__title">DIVERSiON 2K27</span>
        </div>

        <button className="menu__close" type="button" aria-label="Close menu" onClick={onClose} tabIndex={open ? 0 : -1}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <ul className="menu__list">
          {ITEMS.map((item, i) => (
            <li key={item.label}>
              <a
                className={i === active ? 'is-active' : undefined}
                href={item.target ? `#${item.target}` : '#'}
                onClick={go(item.target)}
                tabIndex={open ? 0 : -1}
              >
                {item.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
