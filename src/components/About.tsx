import { useEffect, useRef } from 'react'
import './About.css'

const asset = (name: string) => encodeURI(`/${name}`)

// Photos drift at slightly different speeds as the section scrolls past
const PARALLAX: Record<string, number> = { talk: 0.06, hack: 0.1, team: 0.18 }

export default function About() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = ref.current
    if (!section) return
    const imgs = section.querySelectorAll<HTMLImageElement>('.about__img')
    let frame = 0

    const tick = () => {
      const rect = section.getBoundingClientRect()
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = rect.top + rect.height / 2 - window.innerHeight / 2
        imgs.forEach((img) => {
          const key = img.dataset.parallax ?? ''
          img.style.transform = `translateY(${offset * (PARALLAX[key] ?? 0)}px)`
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
          <img className="about__img about__img--talk" data-parallax="talk" src={asset('about 2.png')} alt="Participants presenting their project" />
        </div>

        <div className="about__photos">
          <img className="about__img about__img--hack" data-parallax="hack" src={asset('about 3.png')} alt="Participants hacking at their laptops" />
          <img className="about__img about__img--team" data-parallax="team" src={asset('about 1.png')} alt="A winning team celebrating with their trophy" />
        </div>
      </div>
    </section>
  )
}
