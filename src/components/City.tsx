import { useEffect, useRef, useState } from 'react'
import { playKolkataMusic, pauseKolkataMusic, isKolkataMusicPlaying } from '@/utils/audio'
import './City.css'

const TOTAL_FRAMES = 288
const SMOOTHING = 0.08
const FADE_OUT_VH = 0.6

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

const getFramePath = (index: number) => {
  const pad = String(index + 1).padStart(3, '0')
  return `/kolkata-frames/ezgif-frame-${pad}.jpg`
}

interface CityProps {
  id?: string
}

const LINE1_TEXT = 'GTA ARRIVES IN KOLKATA CITY'

export default function City({ id = 'city' }: CityProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blackScreenRef = useRef<HTMLDivElement>(null)
  const introLayerRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLDivElement>(null)
  const line2Ref = useRef<HTMLDivElement>(null)
  const charsRef = useRef<(HTMLSpanElement | null)[]>([])
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const imagesRef = useRef<HTMLImageElement[]>([])
  const lastDrawnIndexRef = useRef<number>(-1)
  const lastDrawnWasFallbackRef = useRef<boolean>(false)
  const needsRedrawRef = useRef<boolean>(true)
  const currentTargetFrameRef = useRef<number>(0)

  useEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const canvas = canvasRef.current
    const blackScreen = blackScreenRef.current
    const introLayer = introLayerRef.current
    const line1 = line1Ref.current
    const line2 = line2Ref.current
    if (!section || !sticky || !canvas || !blackScreen || !introLayer || !line1 || !line2) return

    // Preload image frames
    const images: HTMLImageElement[] = []
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.onload = () => {
        if (currentTargetFrameRef.current === i || lastDrawnWasFallbackRef.current) {
          needsRedrawRef.current = true
          renderCanvas(currentTargetFrameRef.current)
        }
      }
      images.push(img)
    }
    imagesRef.current = images

    const renderCanvas = (targetIndex: number) => {
      const cvs = canvasRef.current
      if (!cvs) return
      const ctx = cvs.getContext('2d')
      if (!ctx) return

      const imgs = imagesRef.current
      if (!imgs.length) return

      let img = imgs[targetIndex]
      let isFallback = false

      if (!img || !img.complete || img.naturalWidth === 0) {
        isFallback = true
        let closestIndex = -1
        let minDiff = Infinity
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (imgs[i] && imgs[i].complete && imgs[i].naturalWidth > 0) {
            const diff = Math.abs(i - targetIndex)
            if (diff < minDiff) {
              minDiff = diff
              closestIndex = i
            }
          }
        }
        if (closestIndex !== -1) {
          img = imgs[closestIndex]
        } else {
          return
        }
      }

      if (
        lastDrawnIndexRef.current === targetIndex &&
        !lastDrawnWasFallbackRef.current &&
        !needsRedrawRef.current
      ) {
        return
      }

      needsRedrawRef.current = false

      const cw = cvs.width
      const ch = cvs.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight

      const ratio = Math.max(cw / iw, ch / ih)
      const nw = iw * ratio
      const nh = ih * ratio
      const nx = (cw - nw) / 2
      const ny = (ch - nh) / 2

      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, nx, ny, nw, nh)

      lastDrawnIndexRef.current = targetIndex
      lastDrawnWasFallbackRef.current = isFallback
    }

    // Priority load first frame immediately
    images[0].src = getFramePath(0)
    if (images[0].complete && images[0].naturalWidth > 0) {
      renderCanvas(0)
    }

    // Preload remaining frames
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      images[i].src = getFramePath(i)
    }

    const resizeCanvas = () => {
      const cvs = canvasRef.current
      if (!cvs) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      const targetW = Math.round(w * dpr)
      const targetH = Math.round(h * dpr)
      if (cvs.width !== targetW || cvs.height !== targetH) {
        cvs.width = targetW
        cvs.height = targetH
        needsRedrawRef.current = true
        renderCanvas(currentTargetFrameRef.current)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let current: number | null = null
    let frame = 0

    const tick = () => {
      const vh = window.innerHeight
      const scrolled = -section.getBoundingClientRect().top
      const range = section.offsetHeight - vh
      const target = Math.min(range, Math.max(0, scrolled))
      current = current === null ? target : current + (target - current) * SMOOTHING

      // ==========================================
      // TIMELINE STAGES:
      // 0.0 - 1.2 vh: Line 1 letters appear one by one on scroll
      // 0.9 - 1.7 vh: Line 2 appears ("SCROLL TO EXPLORE")
      // 1.7 - 2.1 vh: Hold text on black screen
      // 2.1 - 2.8 vh: Text dissolves & black screen fades to reveal drone video
      // 2.8 vh onwards: Actual scroll-scrubbing of the 288 frames begins & music plays!
      // ==========================================

      // 1. Line 1: Letters appear one by one on scroll
      const line1Duration = vh * 1.2
      const line1Progress = clamp(current / line1Duration)
      const totalChars = LINE1_TEXT.length

      charsRef.current.forEach((charEl, idx) => {
        if (!charEl) return
        const start = (idx / totalChars) * 0.72
        const duration = 0.28
        const p = clamp((line1Progress - start) / duration)
        const eased = ease(p)
        charEl.style.opacity = String(eased)
        charEl.style.transform = `translateY(${(1 - eased) * 26}px) scale(${0.88 + eased * 0.12})`
      })

      // 2. Line 2: Fades & slides up after Line 1 starts appearing
      const line2Start = vh * 0.9
      const line2Progress = clamp((current - line2Start) / (vh * 0.8))
      const line2Eased = ease(line2Progress)
      line2.style.opacity = String(line2Eased)
      line2.style.transform = `translateY(${(1 - line2Eased) * 32}px)`

      // 3. Intro fade-out & Black screen dissolve
      const dissolveStart = vh * 2.0
      const dissolveDuration = vh * 0.8
      const dissolveProgress = clamp((current - dissolveStart) / dissolveDuration)
      const dissolveEased = ease(dissolveProgress)
      const dissolveOpacity = 1 - dissolveEased

      blackScreen.style.opacity = String(dissolveOpacity)
      introLayer.style.opacity = String(dissolveOpacity)
      introLayer.style.transform = `translateY(${-dissolveEased * 30}px) scale(${1 - dissolveEased * 0.03})`

      if (dissolveOpacity <= 0.005) {
        blackScreen.style.visibility = 'hidden'
        introLayer.style.visibility = 'hidden'
      } else {
        blackScreen.style.visibility = 'visible'
        introLayer.style.visibility = 'visible'
      }

      // 4. Actual video scrubbing begins as dissolve finishes
      const scrubStart = dissolveStart + dissolveDuration
      let targetFrame = 0
      if (current >= scrubStart) {
        const scrubRange = range - scrubStart - vh * FADE_OUT_VH
        const scrubProgress = scrubRange > 0 ? clamp((current - scrubStart) / scrubRange) : 0
        targetFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(scrubProgress * (TOTAL_FRAMES - 1))))
      }

      currentTargetFrameRef.current = targetFrame
      renderCanvas(targetFrame)

      // 5. Fade out section smoothly at end of scroll track
      const fadeStart = range - vh * FADE_OUT_VH
      if (current >= fadeStart && range > fadeStart) {
        const fadeOut = ease(clamp((current - fadeStart) / (vh * FADE_OUT_VH)))
        sticky.style.opacity = String(1 - fadeOut)
      } else {
        sticky.style.opacity = '1'
      }

      // 6. Background audio control: plays in loop when Kolkata video scrubbing starts
      // Stops immediately when user scrolls above (into intro or above section) or below the city section
      const rect = section.getBoundingClientRect()
      const isAbove = current < scrubStart || rect.top > 0
      const isBelow = scrolled >= range || rect.bottom <= 0
      const shouldPlayAudio = !isAbove && !isBelow

      if (shouldPlayAudio) {
        playKolkataMusic()
        if (!isPlayingAudio) setIsPlayingAudio(true)
      } else {
        pauseKolkataMusic()
        if (isPlayingAudio) setIsPlayingAudio(false)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    const onVisibilityChange = () => {
      if (document.hidden) {
        pauseKolkataMusic()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      pauseKolkataMusic()
    }
  }, [])

  return (
    <section ref={sectionRef} id={id} className="city">
      <div ref={stickyRef} className="city__sticky">
        <canvas ref={canvasRef} className="city__canvas" />

        {/* Solid black screen that initially covers the video */}
        <div ref={blackScreenRef} className="city__black-screen" />

        {/* Intro text sequence */}
        <div ref={introLayerRef} className="city__intro">
          <div ref={line1Ref} className="city-intro__line1">
            {LINE1_TEXT.split('').map((char, i) => (
              <span
                key={i}
                ref={(el) => {
                  charsRef.current[i] = el
                }}
                className={`city-intro__char ${char === ' ' ? 'city-intro__char--space' : ''}`}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
          <div ref={line2Ref} className="city-intro__line2">
            SCROLL TO EXPLORE
          </div>
        </div>

        {/* Subtle Vice City Radio indicator / toggle */}
        <button
          type="button"
          className={`city__audio-badge ${isPlayingAudio ? 'city__audio-badge--active' : ''}`}
          onClick={() => {
            if (isKolkataMusicPlaying()) {
              pauseKolkataMusic()
              setIsPlayingAudio(false)
            } else {
              playKolkataMusic()
              setIsPlayingAudio(true)
            }
          }}
          aria-label={isPlayingAudio ? 'Mute Kolkata audio' : 'Play Kolkata audio'}
          title="KOLKATA CITY FM"
        >
          <span className="city__audio-icon">{isPlayingAudio ? '🔊' : '🔇'}</span>
          <span className="city__audio-text">
            {isPlayingAudio ? 'KOLKATA FM • PLAYING' : 'KOLKATA FM • SOUND ON'}
          </span>
        </button>
      </div>
    </section>
  )
}
