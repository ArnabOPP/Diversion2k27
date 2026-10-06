import { useState } from 'react'
import Menu from './Menu'
import './Hero.css'

const asset = (name: string) => encodeURI(`/${name}`)

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <section className="hero">
      <img className="hero__bg" src={asset('hero bg.png')} alt="" />

      <h1 className="hero__text" aria-label="Kolkata. Get ready for Diversion">
        <span className="hero__line hero__line--kolkata">KOLKATA</span>
        <span className="hero__line hero__line--ready">GET READY FOR</span>
        <span className="hero__line hero__line--diversion">DIVERSION</span>
      </h1>

      <img className="hero__chars" src={asset('boygirl.png')} alt="" />

      <img className="hero__logo" src={asset('diversion logo.png')} alt="Diversion 2K27" />
      <img className="hero__mlh" src={asset('mlh 2027 tag.png')} alt="MLH Official 2027 Season" />

      <button className="hero__menu" type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
        <span />
        <span />
      </button>

      <div className="hero__scroll">
        <svg width="26" height="40" viewBox="0 0 26 40" fill="none" aria-hidden>
          <rect x="1.5" y="1.5" width="23" height="37" rx="11.5" stroke="currentColor" strokeWidth="2" />
          <line x1="13" y1="9" x2="13" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>Scroll Down</span>
      </div>

      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </section>
  )
}
