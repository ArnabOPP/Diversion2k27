import './Visit.css'

const asset = (name: string) => encodeURI(`/${name}`)

// Text for each use of this section (the card after the video, and the hacker's guide after the schedule)
const COPY = {
  about: {
    logoTop: 'VISIT',
    logoMain: 'DIVERSION',
    blurb: 'Tour a few of the must-see destinations across the City of Joy.',
    photoAlt: 'Biswa Bangla Gate and the Kolkata skyline',
    title: 'City of Joy',
    brandTop: 'VISIT',
    brandMain: 'DIVERSION',
    button: 'Explore Kolkata City',
  },
  schedule: {
    logoTop: "HACKER'S",
    logoMain: 'GUIDE',
    blurb: 'Everything you need to know before, during and after Diversion 2K27.',
    photoAlt: 'Biswa Bangla Gate and the Kolkata skyline',
    title: "Hacker's Guide",
    brandTop: 'DIVERSION',
    brandMain: '2K27',
    button: 'Read the Guide',
  },
  team: {
    logoTop: 'TEAM',
    logoMain: 'DIVERSION',
    blurb: 'Meet the minds behind Diversion, the students who plan, build and run it every year.',
    photoAlt: 'Placeholder photo for the Team Diversion card',
    title: 'Team Diversion',
    brandTop: 'MEET THE',
    brandMain: 'TEAM',
    button: 'Meet the Team',
  },
  prizes: {
    logoTop: 'WIN',
    logoMain: 'PRIZES',
    blurb: 'Rewards, goodies and swag for the teams that build the boldest ideas.',
    photoAlt: 'Placeholder photo for the prizes card',
    title: 'Win Big',
    brandTop: 'WIN',
    brandMain: 'PRIZES',
    button: 'See All Prizes',
  },
}

interface VisitProps {
  id?: string
  after?: 'about' | 'schedule' // what comes before it: sets its copy and how its top blends in
  videoNext?: boolean // a scrub video follows: leave empty space below for it to emerge from
  end?: boolean // the last section of the page: normal space below instead of the room left for a video
  content?: keyof typeof COPY // which text to show (defaults to the one matching `after`)
}

export default function Visit({ id = 'visit', after = 'about', videoNext = false, end = false, content }: VisitProps) {
  const copy = COPY[content ?? after]

  return (
    <section id={id} className={`visit${after === 'schedule' ? ' visit--last' : ''}${videoNext ? ' visit--video-next' : ''}${end ? ' visit--end' : ''}${content === 'team' ? ' visit--team' : ''}`}>
      <div className="visit__content">
        <header className="visit__header">
          <div className="visit__logo" aria-label={`${copy.logoTop} ${copy.logoMain}`}>
            <span className="visit__logo-visit">{copy.logoTop}</span>
            <span className="visit__logo-name">{copy.logoMain}</span>
            <img src={asset('Scroll Down (18).png')} alt="" aria-hidden="true" />
          </div>
          <p className="visit__blurb">{copy.blurb}</p>
        </header>

        <figure className="visit__card">
          <img className="visit__photo" src={asset('Scroll Down (15).png')} alt={copy.photoAlt} />

          <p className="visit__title">{copy.title}</p>

          <div className="visit__brand">
            <span>{copy.brandTop}</span>
            <span>{copy.brandMain}</span>
            <img src={asset('Scroll Down (18).png')} alt="" aria-hidden="true" />
          </div>

          <button className="visit__button" type="button">
            {copy.button}
          </button>
        </figure>
      </div>
    </section>
  )
}
