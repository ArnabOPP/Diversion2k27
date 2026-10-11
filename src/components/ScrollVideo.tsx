import { useEffect, useRef } from 'react'
import './ScrollVideo.css'

const TOTAL_FRAMES = 288
const SMOOTHING = 0.12 // 0-1: how quickly everything catches up with the scroll position
const ABOUT_HOLD_VH = 0.8 // distance about text stays readable over car frames before animating out
const ABOUT_OUT_VH = 1.0 // scroll distance spent animating the about texts out
const VIDEO_FADE_VH = 0.6 // the sequence's final fade-out spans this much of the last viewport

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

const getFramePath = (index: number) => {
  const pad = String(index + 1).padStart(3, '0')
  return `/kolkata-frames/ezgif-frame-${pad}.jpg`
}

export default function ScrollVideo() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const aboutLayerRef = useRef<HTMLDivElement>(null)

  const imagesRef = useRef<HTMLImageElement[]>([])
  const lastDrawnIndexRef = useRef<number>(-1)
  const lastDrawnWasFallbackRef = useRef<boolean>(false)
  const needsRedrawRef = useRef<boolean>(true)
  const currentTargetFrameRef = useRef<number>(0)

  useEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const canvas = canvasRef.current
    const aboutLayer = aboutLayerRef.current
    if (!section || !sticky || !canvas || !aboutLayer) return

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

      // 1. About text layer: starts fully visible, holds, then animates OUT as user scrolls
      const aboutOutStart = vh * ABOUT_HOLD_VH
      const aboutOutProgress = clamp((current - aboutOutStart) / (vh * ABOUT_OUT_VH))
      const aboutOutEased = ease(aboutOutProgress)
      const aboutOpacity = 1 - aboutOutEased

      aboutLayer.style.opacity = String(aboutOpacity)
      aboutLayer.style.transform = `translateY(${-aboutOutEased * 70}px) scale(${1 - aboutOutEased * 0.05})`
      aboutLayer.style.filter = `blur(${aboutOutEased * 6}px)`
      aboutLayer.style.pointerEvents = aboutOpacity > 0.15 ? 'auto' : 'none'

      // 2. Car frame scrubbing: starts ONLY AFTER the about texts animation completes!
      const scrubStart = aboutOutStart + vh * ABOUT_OUT_VH
      let targetFrame = 0
      if (current >= scrubStart) {
        const scrubRange = range - scrubStart - vh * VIDEO_FADE_VH
        const progress = scrubRange > 0 ? clamp((current - scrubStart) / scrubRange) : 0
        targetFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(progress * (TOTAL_FRAMES - 1))))
      }

      currentTargetFrameRef.current = targetFrame
      renderCanvas(targetFrame)

      // 3. Fade out at the very end as the next section slides over
      const videoOut = ease(clamp((current - (range - vh * VIDEO_FADE_VH)) / (vh * VIDEO_FADE_VH)))
      sticky.style.opacity = String(1 - videoOut)

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <section ref={sectionRef} id="about" className="scroll-video">
      <div ref={stickyRef} className="scroll-video__sticky">
        <canvas ref={canvasRef} className="scroll-video__canvas" />

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
