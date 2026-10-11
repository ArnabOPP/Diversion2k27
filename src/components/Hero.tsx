import { useEffect, useRef, useState } from 'react'
import { playGtaMusic, pauseGtaMusic, stopGtaMusic, resetGtaCurtain, setCurtainActive } from '@/utils/audio'
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
  const [ended, setEnded] = useState(false)
  const endedRef = useRef(false)

  // Ensure video is warmed up and buffered in memory on mount
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.preload = 'auto'
      video.load()
    }
  }, [])

  // Manage GTA music strictly with curtain active state (never during loader)
  useEffect(() => {
    setCurtainActive(active)
    return () => {
      setCurtainActive(false)
    }
  }, [active])

  const playWithSound = () => {
    const video = videoRef.current
    if (!video) return
    // Only seek to 0 if the video has played substantially or completed; avoids seek pipeline stall
    if (video.currentTime > 0.05 && endedRef.current) {
      video.currentTime = 0
    }
    endedRef.current = false
    setEnded(false)
    video.muted = false

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true
        video.play().catch(() => {})

        const onFirstInteraction = () => {
          if (videoRef.current) {
            videoRef.current.muted = false
          }
        }
        window.addEventListener('pointerdown', onFirstInteraction, { once: true })
        window.addEventListener('keydown', onFirstInteraction, { once: true })
        window.addEventListener('click', onFirstInteraction, { once: true })
        window.addEventListener('touchstart', onFirstInteraction, { once: true })
      })
    }
  }

  const handleEnterCity = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    // Stop GTA theme music immediately when curtain begins opening
    stopGtaMusic()

    // Immediate video playback on user gesture avoids audio restriction and starts the 4K decoder pipeline instantly
    playWithSound()

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

    const tick = () => {
      const vh = window.innerHeight
      const scrolled = -section.getBoundingClientRect().top
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

      if (curtainProgress >= CURTAIN_OPEN_THRESHOLD) {
        curtainLayer.style.visibility = 'hidden'
        curtainLayer.style.pointerEvents = 'none'
        sticky.style.zIndex = ''
        if (!curtainWasOpen) {
          curtainWasOpen = true
          stopGtaMusic()
          playWithSound()
        }
      } else {
        curtainLayer.style.visibility = 'visible'
        curtainLayer.style.pointerEvents = curtainProgress < 0.2 ? 'auto' : 'none'
        sticky.style.zIndex = '60'
        if (curtainProgress < 0.05 && curtainWasOpen) {
          curtainWasOpen = false
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
        if (video && !video.paused) {
          video.pause()
        }
        pauseGtaMusic()
      } else {
        // Inside Hero section: resume playback if curtain is open and video not ended
        if (curtainWasOpen && !endedRef.current) {
          if (video && video.paused) {
            video.play().catch(() => {})
          }
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    const onVisibility = () => {
      if (document.hidden) {
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
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
      }
      pauseGtaMusic()
    }
  }, [])

  // Listen for user gestures to automatically unmute if initial playback was restricted by browser
  useEffect(() => {
    const onUserGesture = () => {
      const video = videoRef.current
      if (video && video.muted && !video.paused) {
        video.muted = false
      }
    }

    window.addEventListener('pointerdown', onUserGesture)
    window.addEventListener('click', onUserGesture)
    window.addEventListener('keydown', onUserGesture)
    window.addEventListener('touchstart', onUserGesture)
    return () => {
      window.removeEventListener('pointerdown', onUserGesture)
      window.removeEventListener('click', onUserGesture)
      window.removeEventListener('keydown', onUserGesture)
      window.removeEventListener('touchstart', onUserGesture)
    }
  }, [])

  const playAgain = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    endedRef.current = false
    setEnded(false)
    video.muted = false
    video.play().catch(() => {})
  }

  return (
    <section ref={sectionRef} className="hero-section">
      <div ref={stickyRef} className="hero-section__sticky">
        <div className="hero">
          <video
            ref={videoRef}
            className="hero__bg"
            src={asset('plane-4k.mp4')}
            playsInline
            preload="auto"
            onEnded={() => {
              endedRef.current = true
              setEnded(true)
            }}
          />

          {ended && (
            <>
              <div className="hero__logos">
                <img className="hero__logo hero__logo--iem" src="/iem-logo.png" alt="IEM Logo" />
                <img className="hero__logo hero__logo--acm" src="/acm-logo.png" alt="ACM Chapter IEM Logo" />
                <img className="hero__logo hero__logo--uem" src="/uem-logo.png" alt="UEM Logo" />
              </div>

              <button className="hero__replay" onClick={playAgain} aria-label="Play again">
                ▶ Play Again
              </button>

              <div className="hero__actions">
                <button className="hero__btn hero__btn--register" type="button">
                  REGISTRATIONS OPENING SOON
                </button>
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
            <img className="curtain__media" src="/curtain.jpg" alt="Diversion 2K27" />
          </div>
          <div ref={curtainBottomRef} className="curtain__panel curtain__panel--bottom">
            <img className="curtain__media" src="/curtain.jpg" alt="Diversion 2K27" />
          </div>

          <button
            ref={curtainPromptRef}
            className="curtain__prompt"
            type="button"
            onClick={handleEnterCity}
          >
            ENTER CITY
          </button>
        </div>
      </div>
    </section>
  )
}


