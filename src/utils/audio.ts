// Singleton audio controller for GTA background music
let gtaAudio: HTMLAudioElement | null = null
let curtainOpened = false

export function getGtaAudio(): HTMLAudioElement {
  if (!gtaAudio && typeof window !== 'undefined') {
    gtaAudio = new Audio('/gta.mp3')
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
  if (curtainOpened) return
  const audio = getGtaAudio()
  if (!audio) return

  const p = audio.play()
  if (p !== undefined) {
    p.catch(() => {
      // Browser blocked autoplay without user gesture; arm capture listener
      armGestureUnlock()
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

function armGestureUnlock(): void {
  if (typeof window === 'undefined') return

  const onGesture = () => {
    if (!curtainOpened) {
      const audio = getGtaAudio()
      if (audio && audio.paused) {
        audio.play().then(() => {
          disarm()
        }).catch(() => {})
      }
    }
  }

  const events = ['click', 'pointerdown', 'touchstart', 'keydown']
  const disarm = () => {
    events.forEach((e) => {
      window.removeEventListener(e, onGesture, true)
      document.removeEventListener(e, onGesture, true)
    })
  }

  events.forEach((e) => {
    window.addEventListener(e, onGesture, { capture: true, passive: true })
    document.addEventListener(e, onGesture, { capture: true, passive: true })
  })
}

// Arm gesture listener immediately on load so any first tap/click anywhere starts it
if (typeof window !== 'undefined') {
  armGestureUnlock()
}
