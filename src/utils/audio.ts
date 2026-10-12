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

// ==========================================
// KOLKATA CITY BACKGROUND AUDIO CONTROLLER
// ==========================================
let kolkataAudio: HTMLAudioElement | null = null
let kolkataPlaying = false
let kolkataUnlocked = false

export function getKolkataAudio(): HTMLAudioElement {
  if (!kolkataAudio && typeof window !== 'undefined') {
    const existing = document.getElementById('kolkata-audio') as HTMLAudioElement
    if (existing) {
      kolkataAudio = existing
      if (!kolkataAudio.src.includes('city-1.mp3')) {
        kolkataAudio.src = '/city-1.mp3'
        kolkataAudio.load()
      }
    } else {
      kolkataAudio = new Audio('/city-1.mp3')
      kolkataAudio.id = 'kolkata-audio'
      document.body.appendChild(kolkataAudio)
    }
    kolkataAudio.loop = true
    kolkataAudio.volume = 0.85
    kolkataAudio.preload = 'auto'
  }
  return kolkataAudio!
}

// Global unlock listener: unlock audio elements on the very first user interaction anywhere
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (kolkataUnlocked) return
    kolkataUnlocked = true
    const audio = getKolkataAudio()
    if (audio) {
      // Play and immediately pause to grant user-activation permission to the audio element
      const p = audio.play()
      if (p !== undefined) {
        p.then(() => {
          if (!kolkataPlaying) {
            audio.pause()
            audio.currentTime = 0
          }
        }).catch(() => {
          kolkataUnlocked = false
        })
      }
    }

    const hAudio = getHeroAudio()
    if (hAudio) {
      const p2 = hAudio.play()
      if (p2 !== undefined) {
        p2.then(() => {
          if (!heroPlaying) {
            hAudio.pause()
            hAudio.currentTime = 0
          }
        }).catch(() => {})
      }
    }
  }

  const events = ['pointerdown', 'click', 'keydown', 'touchstart']
  events.forEach((e) => {
    window.addEventListener(e, unlock, { capture: true, passive: true })
    document.addEventListener(e, unlock, { capture: true, passive: true })
  })
}

export function playKolkataMusic(): void {
  if (typeof window === 'undefined') return
  if (kolkataPlaying) return
  kolkataPlaying = true

  const audio = getKolkataAudio()
  if (!audio) return

  audio.muted = false
  const p = audio.play()
  if (p !== undefined) {
    p.catch(() => {
      // If unmuted playback failed, fallback to muted play then unmute on next interaction
      audio.muted = true
      audio.play().catch(() => {})

      const unmute = () => {
        if (kolkataPlaying && audio) {
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

export function pauseKolkataMusic(): void {
  if (typeof window === 'undefined') return
  if (!kolkataPlaying && kolkataAudio && kolkataAudio.paused) return
  kolkataPlaying = false

  if (kolkataAudio && !kolkataAudio.paused) {
    kolkataAudio.pause()
    kolkataAudio.currentTime = 0
  }
}

export function isKolkataMusicPlaying(): boolean {
  return kolkataPlaying
}

// ==========================================
// HERO SECTION AUDIO CONTROLLER (plane-full.mp3)
// ==========================================
let heroAudio: HTMLAudioElement | null = null
let heroPlaying = false

export function getHeroAudio(): HTMLAudioElement {
  if (!heroAudio && typeof window !== 'undefined') {
    const existing = document.getElementById('hero-audio') as HTMLAudioElement
    if (existing) {
      heroAudio = existing
    } else {
      heroAudio = new Audio('/plane-full.mp3')
      heroAudio.id = 'hero-audio'
      document.body.appendChild(heroAudio)
    }
    heroAudio.loop = true
    heroAudio.volume = 0.85
    heroAudio.preload = 'auto'
  }
  return heroAudio!
}

export function playHeroMusic(): void {
  if (typeof window === 'undefined') return
  if (heroPlaying) return
  heroPlaying = true

  const audio = getHeroAudio()
  if (!audio) return

  audio.muted = false
  const p = audio.play()
  if (p !== undefined) {
    p.catch(() => {
      audio.muted = true
      audio.play().catch(() => {})

      const unmute = () => {
        if (heroPlaying && audio) {
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

export function pauseHeroMusic(): void {
  if (typeof window === 'undefined') return
  if (!heroPlaying && heroAudio && heroAudio.paused) return
  heroPlaying = false

  if (heroAudio && !heroAudio.paused) {
    heroAudio.pause()
  }
}

export function stopHeroMusic(): void {
  if (typeof window === 'undefined') return
  heroPlaying = false
  if (heroAudio) {
    heroAudio.pause()
    heroAudio.currentTime = 0
  }
}

export function restartHeroMusic(): void {
  if (typeof window === 'undefined') return
  const audio = getHeroAudio()
  if (!audio) return

  audio.currentTime = 0
  audio.muted = false
  heroPlaying = true
  const p = audio.play()
  if (p !== undefined) {
    p.catch(() => {})
  }
}

export function isHeroMusicPlaying(): boolean {
  return heroPlaying
}


