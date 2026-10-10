// Singleton audio controller for GTA background music
let gtaAudio: HTMLAudioElement | null = null
let curtainActive = false
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

export function isCurtainActive(): boolean {
  return curtainActive
}

export function setCurtainActive(active: boolean): void {
  curtainActive = active
  if (active && !curtainOpened) {
    playGtaMusic()
  } else if (!active) {
    pauseGtaMusic()
  }
}

export function playGtaMusic(): void {
  // Never play audio if curtain is not active (e.g. during loader screen) or already opened
  if (!curtainActive || curtainOpened || typeof window === 'undefined') return
  const audio = getGtaAudio()
  if (!audio) return

  audio.muted = false
  const p = audio.play()
  if (p !== undefined) {
    p.catch(() => {
      // If unmuted autoplay is blocked by browser, start muted so stream is active
      if (!curtainActive || curtainOpened) return
      audio.muted = true
      audio.play().catch(() => {})

      // Unmute on the very first user interaction or cursor movement on the curtain
      const unmute = () => {
        if (curtainActive && !curtainOpened && audio) {
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

export function pauseGtaMusic(): void {
  if (gtaAudio && !gtaAudio.paused) {
    gtaAudio.pause()
    gtaAudio.currentTime = 0
  }
}

export function stopGtaMusic(): void {
  curtainOpened = true
  pauseGtaMusic()
}

export function resetGtaCurtain(): void {
  curtainOpened = false
  if (curtainActive) {
    playGtaMusic()
  }
}
