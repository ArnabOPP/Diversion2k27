import { useEffect, useState } from 'react'
import Menu from './Menu'
import './Header.css'

const asset = (name: string) => encodeURI(`/${name}`)

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      // hero section is 100vh; hide header chrome until user scrolls past it
      setPastHero(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logoClass = [
    'site-header__logo',
    !pastHero && 'is-hidden',
    menuOpen && 'is-hidden',
  ]
    .filter(Boolean)
    .join(' ')

  const menuBtnClass = [
    'site-header__menu',
    !pastHero && 'is-hidden',
    menuOpen && 'is-hidden',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <img className={logoClass} src={asset('logo.png')} alt="Diversion 2K27" />

      <button className={menuBtnClass} type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
        <span />
        <span />
      </button>

      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
