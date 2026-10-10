import { useEffect, useRef, type ReactNode } from 'react'
import './ScrollVideo.css'

const SMOOTHING = 0.12 // 0-1: how quickly everything catches up with the scroll position
const CURTAIN_VH = 1.0 // scroll distance (in viewport heights) spent opening the curtain
const HERO_HOLD_VH = 0.8 // distance hero stays on screen before cross-fading to video
const TRANSITION_VH = 0.8 // scroll distance (in viewport heights) spent cross-fading hero <-> video
const ABOUT_HOLD_VH = 1.2 // distance about text stays readable over car video before animating out
const ABOUT_OUT_VH = 1.0 // scroll distance spent animating the about texts out
const OVERLAP_VH = 0 // how long (in viewports) the video has finished before next section slides over
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
  const aboutLayerRef = useRef<HTMLDivElement>(null)
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
    const aboutLayer = aboutLayerRef.current
    const curtainLayer = curtainLayerRef.current
    const curtainTop = curtainTopRef.current
    const curtainBottom = curtainBottomRef.current
    if (
      !section ||
      !sticky ||
      !heroLayer ||
      !videoLayer ||
      !video ||
      !aboutLayer ||
      !curtainLayer ||
      !curtainTop ||
      !curtainBottom
    )
      return

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

      // 2. Hero stay & cross-fade: hero stays visible, then fades out as car video & about text fade in
      const heroPhaseStart = vh * (CURTAIN_VH + HERO_HOLD_VH)
      const t = ease(clamp((current - heroPhaseStart) / (vh * TRANSITION_VH)))
      const heroOut = t
      const videoIn = ease(clamp((t - 0.2) / 0.8))

      heroLayer.style.opacity = String(1 - heroOut)
      heroLayer.style.pointerEvents = (t > 0.5 || curtainProgress < 0.9) ? 'none' : 'auto'

      // While the next section slides over (last viewport), the car video fades away completely
      const videoOut = ease(clamp((current - (range - vh * VIDEO_FADE_VH)) / (vh * VIDEO_FADE_VH)))
      videoLayer.style.opacity = String(videoIn * (1 - videoOut))
      videoLayer.style.transform = `scale(${1 + SCALE * (1 - videoIn)})`

      // 3. About Diversion text layer: fades in over car video, holds, then animates OUT as user scrolls
      const aboutIn = videoIn
      const aboutOutStart = heroPhaseStart + vh * (TRANSITION_VH + ABOUT_HOLD_VH)
      const aboutOutProgress = clamp((current - aboutOutStart) / (vh * ABOUT_OUT_VH))
      const aboutOutEased = ease(aboutOutProgress)
      const aboutOpacity = aboutIn * (1 - aboutOutEased)

      aboutLayer.style.opacity = String(aboutOpacity)
      aboutLayer.style.transform = `translateY(${-aboutOutEased * 70}px) scale(${1 - aboutOutEased * 0.05})`
      aboutLayer.style.filter = `blur(${aboutOutEased * 6}px)`
      aboutLayer.style.pointerEvents = aboutOpacity > 0.15 ? 'auto' : 'none'

      // 4. Car video scrubbing: starts ONLY AFTER the about texts animation completes!
      if (video.duration) {
        const scrubStart = aboutOutStart + vh * ABOUT_OUT_VH
        if (current < scrubStart) {
          if (!video.seeking && video.currentTime !== 0) video.currentTime = 0
        } else {
          const scrubRange = range - scrubStart - vh * OVERLAP_VH
          const progress = scrubRange > 0 ? clamp((current - scrubStart) / scrubRange) : 0
          const time = progress * video.duration
          if (!video.seeking && Math.abs(video.currentTime - time) > 0.005) video.currentTime = time
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section ref={sectionRef} className="scroll-video">
      <div id="about" className="scroll-video__about-anchor" />
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
        <div ref={aboutLayerRef} className="scroll-video__layer scroll-video__layer--about">
          <div className="scroll-about__card">
            <h2 className="scroll-about__title">ABOUT DIVERSION</h2>
            <h3 className="scroll-about__tagline">Where ideas turn into something real.</h3>
            <div className="scroll-about__body">
              <p>
                Diversion is IEM's annual flagship hackathon, a space where builders, designers and problem-solvers come together to create, learn and compete. Across every edition, students spend intense hours turning bold ideas into working projects.
              </p>
              <p>
                Organised by the IEM-ACM Student Chapter, Diversion brings together technology, collaboration and mentorship across fields like AI, web development, app development, IoT, cloud and more.
              </p>
            </div>
          </div>
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
