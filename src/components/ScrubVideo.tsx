import { useEffect, useRef } from 'react'
import './ScrubVideo.css'

const SMOOTHING = 0.12 // 0-1: how quickly the video catches up with the scroll position
const PLAY_START_VH = -0.4 // playback begins this far (in viewports) from when the video pins; negative = before it pins, while it is still sliding in

const END_FADE_VH = 0.6 // the video fades out completely over this much scrolling at the very end

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

interface Props {
  src: string // an all-intra encode scrubs smoothly (see the scroll-video memory note)
}

// Pins a video to the screen and plays it as the section is scrolled through
export default function ScrubVideo({ src }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const video = videoRef.current
    if (!section || !stage || !video) return

    let current: number | null = null
    let frame = 0

    const tick = () => {
      const vh = window.innerHeight
      const start = vh * PLAY_START_VH
      const range = section.offsetHeight - vh
      const target = Math.min(range, Math.max(start, -section.getBoundingClientRect().top))
      current = current === null ? target : current + (target - current) * SMOOTHING

      // The video fades away completely as the next section takes over
      stage.style.opacity = String(1 - ease(clamp((current - (range - vh * END_FADE_VH)) / (vh * END_FADE_VH))))

      if (video.duration && range > start) {
        const time = clamp((current - start) / (range - start)) * video.duration
        // Skip while a seek is pending so requests don't pile up
        if (!video.seeking && Math.abs(video.currentTime - time) > 0.005) video.currentTime = time
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section ref={sectionRef} className="scrub-video">
      <div ref={stageRef} className="scrub-video__sticky">
        <video
          ref={videoRef}
          className="scrub-video__media"
          src={src}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
        />
      </div>
    </section>
  )
}
