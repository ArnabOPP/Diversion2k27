import './About.css' // shares the section background, the slide-over and the heading styles
import './Partners.css'

interface Partner {
  name: string
  logo: string
  url?: string
  alt?: string
}

interface Tier {
  name: string
  className: string
  partners: Partner[]
}

const TIERS: Tier[] = [
  {
    name: 'GOLD PARTNER',
    className: 'gold',
    partners: [
      {
        name: 'Devfolio',
        logo: '/Devfolio_Logo-Colored.svg',
        url: 'https://devfolio.co',
        alt: 'DEVFOLIO LOGO',
      },
    ],
  },
]

interface PartnersProps {
  id?: string
}

export default function Partners({ id = 'partners' }: PartnersProps) {
  return (
    <section id={id} className="about about--last about--hall partners">
      <div className="about__hall">
        <h2 className="about__title">OUR PARTNERS</h2>

        <div className="partners__tiers">
          {TIERS.map((tier) => (
            <div key={tier.className} className={`partners__tier partners__tier--${tier.className}`}>
              <h4 className="partners__tier-name">{tier.name}</h4>
              <ul className="partners__grid">
                {tier.partners.map((partner) => (
                  <li key={partner.name} className="partners__box partners__box--filled">
                    <a
                      href={partner.url || '#'}
                      target={partner.url ? '_blank' : undefined}
                      rel={partner.url ? 'noopener noreferrer' : undefined}
                      className="partners__link"
                      aria-label={`${partner.name} - ${tier.name}`}
                    >
                      <img
                        src={partner.logo}
                        alt={partner.alt || partner.name}
                        className="partners__logo"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
