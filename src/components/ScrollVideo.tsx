import { useEffect, useRef, type ReactNode } from 'react'
import './ScrollVideo.css'

const SMOOTHING = 0.12 // 0-1: how quickly everything catches up with the scroll position
const CURTAIN_VH = 1.0 // scroll distance (in viewport heights) spent opening the curtain
const HERO_HOLD_VH = 0.8 // distance hero stays on screen before cross-fading to video
const TRANSITION_VH = 0.8 // scroll distance (in viewport heights) spent cross-fading hero <-> video
const OVERLAP_VH = 0 // how long (in viewports) the video has finished before About starts sliding over it
const VIDEO_FADE_VH = 0.6 // the video's final fade-out spans this much of the last viewport
const SCALE = 0.05 // how much the incoming video layer scales down into place

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

interface Props {
  children: ReactNode // the hero, pinned on top until the transition runs
}

export default function ScrollVideo({ children }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const videoLayerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const curtainLayerRef = useRef<HTMLDivElement>(null)
  const curtainTopRef = useRef<HTMLDivElement>(null)
  const curtainBottomRef = useRef<HTMLDivElement>(null)
  const curtainPromptRef = useRef<HTMLButtonElement>(null)

  const handleEnterCity = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    // Dispatch unlock event in direct response to user click (primes audio)
    window.dispatchEvent(new CustomEvent('curtain:unlock'))

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
    const heroLayer = heroRef.current
    const videoLayer = videoLayerRef.current
    const video = videoRef.current
    const curtainLayer = curtainLayerRef.current
    const curtainTop = curtainTopRef.current
    const curtainBottom = curtainBottomRef.current
    if (!section || !sticky || !heroLayer || !videoLayer || !video || !curtainLayer || !curtainTop || !curtainBottom) return

    let current: number | null = null
    let frame = 0
    let curtainWasOpen = false

    const tick = () => {
      const vh = window.innerHeight
      const scrolled = -section.getBoundingClientRect().top
      const range = section.offsetHeight - vh
      const target = Math.min(range, Math.max(0, scrolled))
      current = current === null ? target : current + (target - current) * SMOOTHING

      // 1. Curtain animation: split along horizontal center (top slides up, bottom slides down)
      const curtainProgress = clamp(current / (vh * CURTAIN_VH))
      const curtainEased = ease(curtainProgress)
      const topShift = -curtainEased * 55
      const bottomShift = curtainEased * 55
      curtainTop.style.transform = `translateY(${topShift}%)`
      curtainBottom.style.transform = `translateY(${bottomShift}%)`
      curtainTop.style.setProperty('--seam-opacity', String(curtainProgress))
      curtainBottom.style.setProperty('--seam-opacity', String(curtainProgress))

      // Fade out prompt badge as curtain parts
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
          window.dispatchEvent(new CustomEvent('curtain:open'))
        }
      } else {
        curtainWasOpen = false // reset so next full-open fires again
        curtainLayer.style.visibility = 'visible'
        curtainLayer.style.pointerEvents = curtainProgress < 0.2 ? 'auto' : 'none'
        sticky.style.zIndex = '60'
      }

      // 2. Hero stay & cross-fade: hero stays visible, then fades out as video fades in
      const heroPhaseStart = vh * (CURTAIN_VH + HERO_HOLD_VH)
      const t = ease(clamp((current - heroPhaseStart) / (vh * TRANSITION_VH)))
      const heroOut = t
      const videoIn = ease(clamp((t - 0.2) / 0.8))

      heroLayer.style.opacity = String(1 - heroOut)
      heroLayer.style.pointerEvents = (t > 0.5 || curtainProgress < 0.9) ? 'none' : 'auto'

      // While the next section slides over (last viewport), the video fades away completely
      const videoOut = ease(clamp((current - (range - vh * VIDEO_FADE_VH)) / (vh * VIDEO_FADE_VH)))
      videoLayer.style.opacity = String(videoIn * (1 - videoOut))
      videoLayer.style.transform = `scale(${1 + SCALE * (1 - videoIn)})`

      // 3. After the transition, scroll scrubs the video
      if (video.duration) {
        const scrubStart = heroPhaseStart + vh * TRANSITION_VH
        const scrubRange = range - scrubStart - vh * OVERLAP_VH
        const progress = scrubRange > 0 ? clamp((current - scrubStart) / scrubRange) : 0
        const time = progress * video.duration
        if (!video.seeking && Math.abs(video.currentTime - time) > 0.005) video.currentTime = time
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section ref={sectionRef} className="scroll-video">
      <div ref={stickyRef} className="scroll-video__sticky">
        <div ref={heroRef} className="scroll-video__layer">
          {children}
        </div>
        <div ref={videoLayerRef} className="scroll-video__layer scroll-video__layer--video">
          <video
            ref={videoRef}
            className="scroll-video__media"
            src="/car%20vid%20scrub.mp4"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            tabIndex={-1}
          />
        </div>
        <div
          ref={curtainLayerRef}
          className="scroll-video__layer scroll-video__layer--curtain"
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
