import './About.css'

const asset = (name: string) => encodeURI(`/${name}`)

export default function About() {
  return (
    <section id="about" className="about">
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
          <img className="about__img about__img--talk" src={asset('about 2.png')} alt="Participants presenting their project" />
        </div>

        <div className="about__photos">
          <img className="about__img about__img--hack" src={asset('about 3.png')} alt="Participants hacking at their laptops" />
          <img className="about__img about__img--team" src={asset('about 1.png')} alt="A winning team celebrating with their trophy" />
        </div>
      </div>
    </section>
  )
}
