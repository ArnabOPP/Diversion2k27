import { useEffect, useRef, useState } from 'react'
import './Hero.css'

const asset = (name: string) => encodeURI(`/${name}`)

const SMOOTHING = 0.12
const CURTAIN_VH = 1.0

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const curtainLayerRef = useRef<HTMLDivElement>(null)
  const curtainTopRef = useRef<HTMLDivElement>(null)
  const curtainBottomRef = useRef<HTMLDivElement>(null)
  const curtainPromptRef = useRef<HTMLButtonElement>(null)
  const [ended, setEnded] = useState(false)

  const playWithSound = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
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

    // Prime audio in response to direct user click
    const video = videoRef.current
    if (video) {
      video.muted = false
      const p = video.play()
      if (p !== undefined) {
        p.then(() => {
          video.pause()
          video.currentTime = 0
        }).catch(() => {})
      }
    }

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

      if (curtainProgress >= 1) {
        curtainLayer.style.visibility = 'hidden'
        curtainLayer.style.pointerEvents = 'none'
        sticky.style.zIndex = ''
        if (!curtainWasOpen) {
          curtainWasOpen = true
          playWithSound()
        }
      } else {
        curtainWasOpen = false
        curtainLayer.style.visibility = 'visible'
        curtainLayer.style.pointerEvents = curtainProgress < 0.2 ? 'auto' : 'none'
        sticky.style.zIndex = '60'
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
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
            src={asset('plane.mp4')}
            playsInline
            preload="auto"
            onEnded={() => setEnded(true)}
          />

          {ended && (
            <>
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
          onClick={handleEnterCity}
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


