import { useState } from 'react'
import Menu from './Menu'
import './Header.css'

const asset = (name: string) => encodeURI(`/${name}`)

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <img className={`site-header__logo${menuOpen ? ' is-hidden' : ''}`} src={asset('diversion logo.png')} alt="Diversion 2K27" />

      <button className={`site-header__menu${menuOpen ? ' is-hidden' : ''}`} type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
        <span />
        <span />
      </button>

      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
