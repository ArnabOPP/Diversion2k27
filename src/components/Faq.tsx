import './About.css' // shares the section background, the slide-over and the heading styles
import './Faq.css'

const MLH_CODE_OF_CONDUCT = 'https://mlh.io/code-of-conduct'

// Questions and answers, as supplied. `link` turns the answer's last words into a link.
const QUESTIONS: { q: string; a: string; link?: { label: string; href: string } }[] = [
  {
    q: 'What is Diversion?',
    a: 'Diversion, the annual flagship hackathon organized by the ACM Student Chapter of IEM Kolkata, has been a prestigious event since its inception in 2017.',
  },
  {
    q: 'How can I register?',
    a: 'Click on the Apply with Devfolio button at the top to register for Diversion.',
  },
  {
    q: 'Is usage of prior work allowed?',
    a: 'No prior work should be used for demonstration in the event.',
  },
  {
    q: 'Is Diversion 2K27 offline or online?',
    a: 'Diversion 2K27 is an offline 36-hour long hackathon.',
  },
  {
    q: 'How many members can participate in one team?',
    a: 'A maximum of 4 members are allowed in a team. Solo participation is also allowed.',
  },
  {
    q: 'What kind of projects are encouraged by Diversion 2K27?',
    a: 'Diversion 2K27 encourages projects from various domains, including Web Development, App Development, Web3 & Blockchain, Artificial Intelligence, Machine Learning, Augmented Reality, and Cloud Computing.',
  },
  {
    q: 'Is Diversion 2K27 designed as a free event?',
    a: 'Yes, Diversion 2K27 is designed as a totally free event, and for participants with a passion for technology.',
  },
  {
    q: 'Click to check out the MLH code of conduct',
    a: 'Click there to check out the MLH Code Of Conduct.',
    link: { label: 'MLH Code Of Conduct', href: MLH_CODE_OF_CONDUCT },
  },
]

interface FaqProps {
  id?: string
}

export default function Faq({ id = 'faq' }: FaqProps) {
  return (
    <section id={id} className="about about--last faq">
      <div className="faq__inner">
        <div className="faq__intro">
          <h2 className="about__title">FAQ</h2>
          <h3 className="about__tagline">{'Got questions?\nWe have answers.'}</h3>
        </div>

        <div className="faq__list">
          {QUESTIONS.map((item, i) => (
            <details key={item.q} className="faq__item" open={i === 0}>
              <summary>
                <span className="faq__q">{item.q}</span>
                <span className="faq__icon" aria-hidden="true" />
              </summary>
              <p className="faq__a">
                {item.a}
                {item.link && (
                  <>
                    {' '}
                    <a href={item.link.href} target="_blank" rel="noopener noreferrer">
                      {item.link.label}
                    </a>
                  </>
                )}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
