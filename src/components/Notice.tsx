import './Notice.css'

const warnings = [
  'Do not close or turn off the system while the event interface is loading.',
  'Do not leave the page while event data is being initialized.',
  'Do not disconnect your internet while connecting to the DIVERSION 2K27 servers.',
]

export default function Notice() {
  return (
    <section className="notice">
      <div className="notice__body">
        <p>
          The content of this website and event is purely fictional and is not
          intended to represent or depict any real event, person, organization
          or entity, and any similarity is purely coincidental. The organizers
          and contributors of DIVERSION 2K27 do not endorse or support any
          conduct, activities or elements shown on this website that may
          resemble those of Rockstar Games or any of its properties. This
          website is created solely for a student hackathon and all event
          details, references and creative materials are intended for
          non-commercial, educational and community purposes. For more
          information about the event, rules, prizes and participation
          guidelines, visit www.diversion2k27.in.
        </p>
        <p>
          DIVERSION 2K27 is an independent student hackathon organized by the
          IEM-ACM Student Chapter, Kolkata, and is not affiliated with,
          sponsored by, endorsed by, or connected to Rockstar Games, Take-Two
          Interactive, or Grand Theft Auto. All names, logos, artwork and
          references to third-party brands are the property of their respective
          owners and are used only for thematic and non-commercial purposes.
          This event is a student-led initiative and all participation is
          subject to the official rules and code of conduct. No purchase is
          necessary to participate.
        </p>
      </div>

      <ul className="notice__loaders">
        {warnings.map((text, i) => (
          <li key={text} className={i === 2 ? 'is-amber' : undefined}>
            <span className="spinner" style={{ animationDelay: `${i * -0.25}s` }} />
            {text}
          </li>
        ))}
      </ul>
    </section>
  )
}
