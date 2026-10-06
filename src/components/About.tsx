import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './About.css'

const asset = (name: string) => encodeURI(`/${name}`)

// Photos drift at slightly different speeds as the section scrolls past
const PARALLAX = { talk: 0.06, hack: 0.1, team: 0.18 }

type PhotoName = keyof typeof PARALLAX
type OpenPhoto = { src: string; alt: string }

export default function About() {
  const ref = useRef<HTMLElement>(null)
  const [lightbox, setLightbox] = useState<OpenPhoto | null>(null)

  useEffect(() => {
    const section = ref.current
    if (!section) return
    const photos = section.querySelectorAll<HTMLElement>('.about__photo')
    let frame = 0

    const tick = () => {
      const rect = section.getBoundingClientRect()
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = rect.top + rect.height / 2 - window.innerHeight / 2
        photos.forEach((photo) => {
          const key = (photo.dataset.parallax ?? '') as PhotoName
          photo.style.transform = `translateY(${offset * (PARALLAX[key] ?? 0)}px)`
        })
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section ref={ref} id="about" className="about">
      <div className="about__inner">
        <div className="about__copy">
          <h2 className="about__title">ABOUT DIVERSION</h2>
          <h3 className="about__tagline">Where ideas turn into something real.</h3>
          <p>
            Diversion is IEM’s annual flagship hackathon — a space where builders, designers and problem-solvers come
            together to create, learn and compete. Across every edition, students spend intense hours turning bold ideas
            into working projects.
          </p>
          <p>
            Organised by the IEM-ACM Student Chapter, Diversion brings together technology, collaboration and mentorship
            across fields like AI, web development, app development, IoT, cloud and more.
          </p>
          <Photo name="talk" src={asset('about 2.png')} alt="Participants presenting their project" onOpen={setLightbox} />
        </div>

        <div className="about__photos">
          <Photo name="hack" src={asset('about 3.png')} alt="Participants hacking at their laptops" onOpen={setLightbox} />
          <Photo name="team" src={asset('about 1.png')} alt="A winning team celebrating with their trophy" onOpen={setLightbox} />
        </div>
      </div>

      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}
    </section>
  )
}

interface PhotoProps extends OpenPhoto {
  name: PhotoName
  onOpen: (photo: OpenPhoto) => void
}

function Photo({ name, src, alt, onOpen }: PhotoProps) {
  return (
    // Clicking anywhere on the photo opens it; the button's click bubbles up here too (keeps keyboard access)
    <div className={`about__photo about__photo--${name}`} data-parallax={name} onClick={() => onOpen({ src, alt })}>
      <img src={src} alt={alt} />
      <button className="about__open" type="button" aria-label={`Open photo: ${alt}`}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M10.5 2H16v5.5M7.5 16H2v-5.5M16 2l-5.5 5.5M2 16l5.5-5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

interface LightboxProps extends OpenPhoto {
  onClose: () => void
}

// Full-screen viewer; rendered in a portal so it sits above the fixed header and menu
function Lightbox({ src, alt, onClose }: LightboxProps) {
  useEffect(() => {
    document.documentElement.classList.add('no-scroll')
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.classList.remove('no-scroll')
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <img className="lightbox__img" src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
      <button className="lightbox__close" type="button" aria-label="Close photo" onClick={onClose}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>,
    document.body,
  )
}
