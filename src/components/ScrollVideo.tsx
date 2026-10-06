import { useEffect, useRef, type ReactNode } from 'react'
import './ScrollVideo.css'

const SMOOTHING = 0.12 // 0-1: how quickly everything catches up with the scroll position
const TRANSITION_VH = 0.8 // scroll distance (in viewport heights) spent cross-fading hero <-> video
const OVERLAP_VH = 0 // how long (in viewports) the video has finished before About starts sliding over it; 0 = About starts a full screen before the video ends, 1 = after it ends
const VIDEO_FADE_VH = 0.6 // the video's final fade-out spans this much of the last viewport (smaller = starts later)
const SCALE = 0.05 // how much the incoming video layer scales down into place

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

interface Props {
  children: ReactNode // the hero, pinned on top until the transition runs
}

export default function ScrollVideo({ children }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const videoLayerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const heroLayer = heroRef.current
    const videoLayer = videoLayerRef.current
    const video = videoRef.current
    if (!section || !heroLayer || !videoLayer || !video) return

    let current: number | null = null
    let frame = 0

    const tick = () => {
      const vh = window.innerHeight
      const scrolled = -section.getBoundingClientRect().top
      const range = section.offsetHeight - vh
      const target = Math.min(range, Math.max(0, scrolled))
      current = current === null ? target : current + (target - current) * SMOOTHING

      // Cross-fade: hero fades out (no scaling), video fades in from slightly larger
      const t = ease(clamp(current / (vh * TRANSITION_VH)))
      const heroOut = t
      const videoIn = ease(clamp((t - 0.2) / 0.8))
      heroLayer.style.opacity = String(1 - heroOut)
      heroLayer.style.pointerEvents = t > 0.5 ? 'none' : 'auto'
      // While the next section slides over (last viewport), the video fades away completely
      const videoOut = ease(clamp((current - (range - vh * VIDEO_FADE_VH)) / (vh * VIDEO_FADE_VH)))
      videoLayer.style.opacity = String(videoIn * (1 - videoOut))
      videoLayer.style.transform = `scale(${1 + SCALE * (1 - videoIn)})`

      // After the transition, scroll scrubs the video
      if (video.duration) {
        const scrubRange = range - vh * (TRANSITION_VH + OVERLAP_VH)
        const progress = scrubRange > 0 ? clamp((current - vh * TRANSITION_VH) / scrubRange) : 0
        const time = progress * video.duration
        // Skip while a seek is pending so requests don't pile up
        if (!video.seeking && Math.abs(video.currentTime - time) > 0.005) video.currentTime = time
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section ref={sectionRef} className="scroll-video">
      <div className="scroll-video__sticky">
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
      </div>
    </section>
  )
}
