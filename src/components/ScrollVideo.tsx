import { useEffect, useRef } from 'react'
import './ScrollVideo.css'

const SMOOTHING = 0.12 // 0-1: how quickly everything catches up with the scroll position
const ABOUT_HOLD_VH = 0.8 // distance about text stays readable over car video before animating out
const ABOUT_OUT_VH = 1.0 // scroll distance spent animating the about texts out
const VIDEO_FADE_VH = 0.6 // the video's final fade-out spans this much of the last viewport

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

export default function ScrollVideo() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const aboutLayerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const video = videoRef.current
    const aboutLayer = aboutLayerRef.current
    if (!section || !sticky || !video || !aboutLayer) return

    let current: number | null = null
    let frame = 0

    const tick = () => {
      const vh = window.innerHeight
      const scrolled = -section.getBoundingClientRect().top
      const range = section.offsetHeight - vh
      const target = Math.min(range, Math.max(0, scrolled))
      current = current === null ? target : current + (target - current) * SMOOTHING

      // 1. About text layer: starts fully visible, holds, then animates OUT as user scrolls
      const aboutOutStart = vh * ABOUT_HOLD_VH
      const aboutOutProgress = clamp((current - aboutOutStart) / (vh * ABOUT_OUT_VH))
      const aboutOutEased = ease(aboutOutProgress)
      const aboutOpacity = 1 - aboutOutEased

      aboutLayer.style.opacity = String(aboutOpacity)
      aboutLayer.style.transform = `translateY(${-aboutOutEased * 70}px) scale(${1 - aboutOutEased * 0.05})`
      aboutLayer.style.filter = `blur(${aboutOutEased * 6}px)`
      aboutLayer.style.pointerEvents = aboutOpacity > 0.15 ? 'auto' : 'none'

      // 2. Car video scrubbing: starts ONLY AFTER the about texts animation completes!
      const scrubStart = aboutOutStart + vh * ABOUT_OUT_VH
      if (video.duration) {
        if (current < scrubStart) {
          if (!video.seeking && video.currentTime !== 0) video.currentTime = 0
        } else {
          const scrubRange = range - scrubStart - vh * VIDEO_FADE_VH
          const progress = scrubRange > 0 ? clamp((current - scrubStart) / scrubRange) : 0
          const time = progress * video.duration
          if (!video.seeking && Math.abs(video.currentTime - time) > 0.005) video.currentTime = time
        }
      }

      // 3. Fade out video at the very end as the next section slides over
      const videoOut = ease(clamp((current - (range - vh * VIDEO_FADE_VH)) / (vh * VIDEO_FADE_VH)))
      sticky.style.opacity = String(1 - videoOut)

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section ref={sectionRef} id="about" className="scroll-video">
      <div ref={stickyRef} className="scroll-video__sticky">
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
      </div>
    </section>
  )
}
