import { useEffect, useRef, useState } from 'react'
import {
  playGtaMusic,
  pauseGtaMusic,
  stopGtaMusic,
  resetGtaCurtain,
  setCurtainActive,
  playHeroMusic,
  pauseHeroMusic,
  stopHeroMusic,
  restartHeroMusic,
} from '@/utils/audio'
import './Hero.css'

const asset = (name: string) => encodeURI(`/${name}`)

const SMOOTHING = 0.18
const CURTAIN_VH = 1.0
const CURTAIN_OPEN_THRESHOLD = 0.88 // Trigger playback as soon as curtain panels clear the screen

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

interface HeroProps {
  active?: boolean
}

export default function Hero({ active = true }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const curtainLayerRef = useRef<HTMLDivElement>(null)
  const curtainTopRef = useRef<HTMLDivElement>(null)
  const curtainBottomRef = useRef<HTMLDivElement>(null)
  const curtainPromptRef = useRef<HTMLButtonElement>(null)
  const curtainBorderRef = useRef<HTMLDivElement>(null)
  const hasOpenedRef = useRef<boolean>(false)
  const [ended, setEnded] = useState(false)
  const endedRef = useRef(false)
  const [showTitleLogo, setShowTitleLogo] = useState(false)
  const [videoSrc, setVideoSrc] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      return asset('plane-mobile-2.mp4')
    }
    return asset('plane-4k.mp4')
  })

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    const updateSrc = () => {
      setVideoSrc(mql.matches ? asset('plane-mobile-2.mp4') : asset('plane-4k.mp4'))
    }
    mql.addEventListener('change', updateSrc)
    return () => mql.removeEventListener('change', updateSrc)
  }, [])

  // Listen for plane exit (around 3.2s) to show the Diversion 2K27 title logo
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.currentTime >= 3.2) {
        setShowTitleLogo(true)
      } else if (video.currentTime < 1.0) {
        setShowTitleLogo(false)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [videoSrc])

  // Ensure video is warmed up and buffered in memory on mount or src change
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.preload = 'auto'
      video.muted = true
      video.load()
    }
  }, [videoSrc])

  // Manage GTA music strictly with curtain active state (never during loader)
  useEffect(() => {
    setCurtainActive(active)
    return () => {
      setCurtainActive(false)
    }
  }, [active])

  const startHeroPlayback = () => {
    const video = videoRef.current
    if (video) {
      if (video.currentTime > 0.05 && endedRef.current) {
        video.currentTime = 0
      }
      endedRef.current = false
      setEnded(false)
      setShowTitleLogo(false)
      video.muted = true
      video.play().catch(() => {})
    }
    // Play plane-full.mp3 in loop
    playHeroMusic()
  }

  const handleEnterCity = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    // Unlock scrolling for this session once button is pressed
    hasOpenedRef.current = true

    // Stop GTA theme music immediately when curtain begins opening
    stopGtaMusic()

    // Start hero video and looping plane-full.mp3 audio
    startHeroPlayback()

    const section = sectionRef.current
    if (section) {
      const vh = window.innerHeight
      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      const targetY = sectionTop + vh * CURTAIN_VH + 10
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const curtainLayer = curtainLayerRef.current
    const curtainTop = curtainTopRef.current
    const curtainBottom = curtainBottomRef.current
    if (!section || !sticky || !curtainLayer || !curtainTop || !curtainBottom) return

    let current: number | null = null
    let frame = 0
    let curtainWasOpen = false

    // Prevent scrolling from opening the curtain until the ENTER CITY button is pressed
    const onWheel = (e: WheelEvent) => {
      if (!hasOpenedRef.current) {
        e.preventDefault()
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!hasOpenedRef.current) {
        e.preventDefault()
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!hasOpenedRef.current) {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Space', 'Home', 'End'].includes(e.key)) {
          if (
            (e.key === ' ' || e.key === 'Space' || e.key === 'Enter') &&
            document.activeElement === curtainPromptRef.current
          ) {
            return
          }
          const tag = (document.activeElement?.tagName || '').toLowerCase()
          if (tag !== 'input' && tag !== 'textarea') {
            e.preventDefault()
          }
        }
      }
    }

    const onScroll = () => {
      if (!hasOpenedRef.current && window.scrollY > 0) {
        window.scrollTo(0, 0)
      }
    }

    if (!hasOpenedRef.current && window.scrollY > 0) {
      window.scrollTo(0, 0)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      const vh = window.innerHeight
      const scrolled = hasOpenedRef.current ? -section.getBoundingClientRect().top : 0
      const range = section.offsetHeight - vh
      const target = Math.min(range, Math.max(0, scrolled))
      current = current === null ? target : current + (target - current) * SMOOTHING

      // Curtain split animation
      const curtainProgress = clamp(current / (vh * CURTAIN_VH))
      const curtainEased = ease(curtainProgress)
      const topShift = -curtainEased * 55
      const bottomShift = curtainEased * 55
      curtainTop.style.transform = `translateY(${topShift}%)`
      curtainBottom.style.transform = `translateY(${bottomShift}%)`
      curtainTop.style.setProperty('--seam-opacity', String(curtainProgress))
      curtainBottom.style.setProperty('--seam-opacity', String(curtainProgress))

      if (curtainPromptRef.current) {
        const pOpacity = clamp(1 - curtainProgress * 2.8)
        curtainPromptRef.current.style.opacity = String(pOpacity)
        curtainPromptRef.current.style.pointerEvents = pOpacity > 0.1 ? 'auto' : 'none'
      }

      if (curtainBorderRef.current) {
        const bOpacity = clamp(1 - curtainProgress * 2.5)
        curtainBorderRef.current.style.opacity = String(bOpacity)
      }

      if (curtainProgress >= CURTAIN_OPEN_THRESHOLD) {
        curtainLayer.style.visibility = 'hidden'
        curtainLayer.style.pointerEvents = 'none'
        sticky.style.zIndex = ''
        if (!curtainWasOpen) {
          curtainWasOpen = true
          stopGtaMusic()
          startHeroPlayback()
        }
      } else {
        curtainLayer.style.visibility = 'visible'
        curtainLayer.style.pointerEvents = curtainProgress < 0.2 ? 'auto' : 'none'
        sticky.style.zIndex = '60'
        if (curtainProgress < 0.05 && curtainWasOpen) {
          curtainWasOpen = false
          stopHeroMusic()
          const video = videoRef.current
          if (video && !video.paused) {
            video.pause()
            video.currentTime = 0
            endedRef.current = false
            setEnded(false)
          }
          resetGtaCurtain()
        }
      }

      // Check whether Hero section is currently in view
      // When scrolled down or up away from Hero section, all audio must stop
      const rect = section.getBoundingClientRect()
      const isPastBottom = scrolled >= range || rect.bottom <= 0
      const isBeforeTop = rect.top > 0 && scrolled < 0
      const isInsideHero = !isPastBottom && !isBeforeTop

      const video = videoRef.current

      if (!isInsideHero) {
        // Scrolled down or up away from Hero section: pause all hero audio immediately
        pauseHeroMusic()
        if (video && !video.paused) {
          video.pause()
        }
        pauseGtaMusic()
      } else {
        // Inside Hero section: keep playing plane-full.mp3 in loop while in hero
        if (curtainWasOpen) {
          playHeroMusic()
          if (video && video.paused && !endedRef.current) {
            video.play().catch(() => {})
          }
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    const onVisibility = () => {
      if (document.hidden) {
        pauseHeroMusic()
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause()
        }
        pauseGtaMusic()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll)
      pauseHeroMusic()
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
      }
      pauseGtaMusic()
    }
  }, [])

  // Load Devfolio Apply Button SDK when actions are visible
  useEffect(() => {
    if (!ended) return
    const script = document.createElement('script')
    script.src = 'https://apply.devfolio.co/v2/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [ended])

  const playAgain = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    endedRef.current = false
    setEnded(false)
    setShowTitleLogo(false)
    video.muted = true
    video.play().catch(() => {})
    restartHeroMusic()
  }

  return (
    <section ref={sectionRef} className="hero-section">
      <div ref={stickyRef} className="hero-section__sticky">
        <div className="hero">
          <video
            ref={videoRef}
            key={videoSrc}
            className="hero__bg"
            src={videoSrc}
            playsInline
            preload="auto"
            muted
            onEnded={() => {
              endedRef.current = true
              setEnded(true)
              setShowTitleLogo(true)
            }}
          />

          {showTitleLogo && (
            <img
              className="hero__title-logo"
              src="/diversion%20logo.png"
              alt="Diversion 2K27"
            />
          )}

          {ended && (
            <>
              <div className="hero__logos">
                <img className="hero__logo hero__logo--iem" src="/iem-logo.png?v=2" alt="IEM Logo" />
                <img className="hero__logo hero__logo--acm" src="/acm-logo.png?v=2" alt="ACM Chapter IEM Logo" />
                <img className="hero__logo hero__logo--uem" src="/uem-logo.png?v=2" alt="UEM Logo" />
              </div>

              <button className="hero__replay" onClick={playAgain} aria-label="Play again">
                ▶ Play Again
              </button>

              <div className="hero__actions">
                <div
                  className="apply-button"
                  data-hackathon-slug="diversion2k27"
                  data-button-theme="light"
                  style={{ height: '44px', width: '312px' }}
                ></div>
                <button className="hero__btn hero__btn--brochure" type="button">
                  BROCHURE COMING SOON
                </button>
              </div>
            </>
          )}
        </div>

        <div
          ref={curtainLayerRef}
          className="hero-curtain"
          onClick={() => playGtaMusic()}
        >
          <div ref={curtainTopRef} className="curtain__panel curtain__panel--top">
            <picture className="curtain__picture">
              <source media="(max-width: 768px)" srcSet="/curtain-mobile.jpg" />
              <img className="curtain__media" src="/curtain.jpg" alt="Diversion 2K27" />
            </picture>
          </div>
          <div ref={curtainBottomRef} className="curtain__panel curtain__panel--bottom">
            <picture className="curtain__picture">
              <source media="(max-width: 768px)" srcSet="/curtain-mobile.jpg" />
              <img className="curtain__media" src="/curtain.jpg" alt="Diversion 2K27" />
            </picture>
          </div>

          {/* Light purple glow moving around the border in a rectangle */}
          <div ref={curtainBorderRef} className="curtain__border-glow" aria-hidden="true">
            <span className="curtain__glow-line curtain__glow-line--top" />
            <span className="curtain__glow-line curtain__glow-line--right" />
            <span className="curtain__glow-line curtain__glow-line--bottom" />
            <span className="curtain__glow-line curtain__glow-line--left" />
          </div>

          <button
            ref={curtainPromptRef}
            className="curtain__prompt"
            type="button"
            onClick={handleEnterCity}
          >
            <span className="curtain__prompt-inner">ENTER CITY</span>
          </button>
        </div>
      </div>
    </section>
  )
}


