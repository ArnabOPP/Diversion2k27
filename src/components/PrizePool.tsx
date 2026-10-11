import { useEffect, useRef } from 'react'
import './PrizePool.css'

const TOTAL_FRAMES = 288
const SMOOTHING = 0.12
const FADE_OUT_VH = 0.6

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

const getFramePath = (index: number) => {
  const pad = String(index + 1).padStart(3, '0')
  return `/kolkata-frames/ezgif-frame-${pad}.jpg`
}

interface PrizePoolProps {
  id?: string
}

export default function PrizePool({ id = 'prizes' }: PrizePoolProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentLayerRef = useRef<HTMLDivElement>(null)

  const imagesRef = useRef<HTMLImageElement[]>([])
  const lastDrawnIndexRef = useRef<number>(-1)
  const lastDrawnWasFallbackRef = useRef<boolean>(false)
  const needsRedrawRef = useRef<boolean>(true)
  const currentTargetFrameRef = useRef<number>(0)

  useEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const canvas = canvasRef.current
    const contentLayer = contentLayerRef.current
    if (!section || !sticky || !canvas || !contentLayer) return

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

      // Frame scrubbing across the 288 Kolkata drone frames
      const progress = range > 0 ? clamp(current / range) : 0
      const targetFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(progress * (TOTAL_FRAMES - 1))))
      currentTargetFrameRef.current = targetFrame
      renderCanvas(targetFrame)

      // Fade out gently as next section approaches
      const fadeStart = range - vh * FADE_OUT_VH
      if (current >= fadeStart && range > fadeStart) {
        const fadeOut = ease(clamp((current - fadeStart) / (vh * FADE_OUT_VH)))
        sticky.style.opacity = String(1 - fadeOut)
      } else {
        sticky.style.opacity = '1'
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <section ref={sectionRef} id={id} className="prize-pool">
      <div ref={stickyRef} className="prize-pool__sticky">
        <canvas ref={canvasRef} className="prize-pool__canvas" />
        <div className="prize-pool__overlay" />

        <div ref={contentLayerRef} className="prize-pool__content">
          <div className="prize-pool__card">
            <h2 className="prize-pool__title">PRIZE POOL</h2>
            <h3 className="prize-pool__tagline">COMING SOON</h3>
          </div>
        </div>
      </div>
    </section>
  )
}
