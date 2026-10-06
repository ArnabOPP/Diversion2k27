import { useEffect } from 'react'
import './Menu.css'

const ITEMS = ['Home', 'About', 'Events', 'Schedule', 'Sponsors', 'Contact']

interface Props {
  open: boolean
  onClose: () => void
}

export default function Menu({ open, onClose }: Props) {
  // Lock page scroll and close on Escape while the menu is open
  useEffect(() => {
    if (!open) return
    document.documentElement.classList.add('no-scroll')
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.classList.remove('no-scroll')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

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
            <li key={item}>
              <a className={i === 0 ? 'is-active' : undefined} href={`#${item.toLowerCase()}`} onClick={onClose} tabIndex={open ? 0 : -1}>
                {item.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
