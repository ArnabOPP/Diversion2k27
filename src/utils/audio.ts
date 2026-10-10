// Singleton audio controller for GTA background music
let gtaAudio: HTMLAudioElement | null = null
let curtainOpened = false

export function getGtaAudio(): HTMLAudioElement {
  if (!gtaAudio && typeof window !== 'undefined') {
    const existing = document.getElementById('gta-audio') as HTMLAudioElement
    if (existing) {
      gtaAudio = existing
    } else {
      gtaAudio = new Audio('/gta.mp3')
      gtaAudio.id = 'gta-audio'
      document.body.appendChild(gtaAudio)
    }
    gtaAudio.loop = true
    gtaAudio.volume = 0.75
    gtaAudio.preload = 'auto'
  }
  return gtaAudio!
}

export function isCurtainOpened(): boolean {
  return curtainOpened
}

export function playGtaMusic(): void {
  if (curtainOpened || typeof window === 'undefined') return
  const audio = getGtaAudio()
  if (!audio) return

  audio.muted = false
  const p = audio.play()
  if (p !== undefined) {
    p.catch(() => {
      // If unmuted autoplay is blocked on initial load, play muted so the stream starts immediately
      audio.muted = true
      audio.play().catch(() => {})

      // Unmute on the very first user interaction or document focus
      const unmute = () => {
        if (!curtainOpened && audio) {
          audio.muted = false
          if (audio.paused) {
            audio.play().catch(() => {})
          }
        }
        removeListeners()
      }

      const events = [
        'pointerdown',
        'pointermove',
        'mousemove',
        'click',
        'keydown',
        'touchstart',
        'scroll',
        'wheel',
        'focus',
        'mouseenter',
      ]
      const removeListeners = () => {
        events.forEach((e) => {
          window.removeEventListener(e, unmute, true)
          document.removeEventListener(e, unmute, true)
        })
      }

      events.forEach((e) => {
        window.addEventListener(e, unmute, { capture: true, passive: true })
        document.addEventListener(e, unmute, { capture: true, passive: true })
      })
    })
  }
}

export function stopGtaMusic(): void {
  curtainOpened = true
  if (gtaAudio && !gtaAudio.paused) {
    gtaAudio.pause()
    gtaAudio.currentTime = 0
  }
}

export function resetGtaCurtain(): void {
  curtainOpened = false
  playGtaMusic()
}

// Automatically start playback as soon as the script or DOM loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => playGtaMusic())
  } else {
    playGtaMusic()
  }
  window.addEventListener('load', () => playGtaMusic())
  window.addEventListener('pageshow', () => playGtaMusic())
}
