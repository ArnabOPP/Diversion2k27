import { useEffect, useRef, useState } from 'react'
import './Hero.css'

const asset = (name: string) => encodeURI(`/${name}`)

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    const playWithSound = () => {
      const video = videoRef.current
      if (!video) return
      video.currentTime = 0
      setEnded(false)
      video.muted = false

      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser autoplay policy blocks unmuted audio on first gesture,
          // temporarily play muted so video still rolls visually
          video.muted = true
          video.play().catch(() => {})

          // And immediately unmute on the first user interaction
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

    const onCurtainOpen = () => {
      playWithSound()
    }

    const onCurtainUnlock = () => {
      const video = videoRef.current
      if (!video) return
      video.muted = false
      const p = video.play()
      if (p !== undefined) {
        p.then(() => {
          video.pause()
          video.currentTime = 0
        }).catch(() => {})
      }
    }

    window.addEventListener('curtain:open', onCurtainOpen)
    window.addEventListener('curtain:unlock', onCurtainUnlock)
    return () => {
      window.removeEventListener('curtain:open', onCurtainOpen)
      window.removeEventListener('curtain:unlock', onCurtainUnlock)
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
    setEnded(false)
    video.muted = false
    video.play().catch(() => {})
  }

  return (
    <section className="hero">
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
    </section>
  )
}

