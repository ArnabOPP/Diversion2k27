import './About.css' // shares the section background, the slide-over and the heading styles
import './Partners.css'

// Sponsorship tiers: the higher the tier, the fewer and bigger the boxes (swap in logos later)
const TIERS = [
  { name: 'TITLE PARTNER', className: 'title', boxes: 1 },
  { name: 'ELITE PARTNERS', className: 'elite', boxes: 2 },
  { name: 'GOLD PARTNERS', className: 'gold', boxes: 3 },
  { name: 'SILVER PARTNERS', className: 'silver', boxes: 4 },
]
const COMMUNITY_BOXES = 16 // 4 x 4

interface PartnersProps {
  id?: string
}

export default function Partners({ id = 'partners' }: PartnersProps) {
  return (
    <section id={id} className="about about--last about--hall partners">
      <div className="about__hall">
        <h2 className="about__title">OUR PARTNERS</h2>
        <h3 className="about__tagline">Backed by the best in the business, powering every idea.</h3>

        <div className="partners__tiers">
          {TIERS.map((tier) => (
            <div key={tier.className} className={`partners__tier partners__tier--${tier.className}`}>
              <h4 className="partners__tier-name">{tier.name}</h4>
              <ul className="partners__grid" style={{ gridTemplateColumns: `repeat(${tier.boxes}, 1fr)` }}>
                {Array.from({ length: tier.boxes }, (_, i) => (
                  <li key={i} className="partners__box">
                    <span className="partners__label">Partner logo</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="about__title partners__community-title">COMMUNITY PARTNERS</h2>
        <h3 className="about__tagline">{'The communities\nbuilding with us.'}</h3>

        <ul className="partners__grid partners__grid--community">
          {Array.from({ length: COMMUNITY_BOXES }, (_, i) => (
            <li key={i} className="partners__box">
              <span className="partners__label">Community logo</span>
            </li>
          ))}
        </ul>

        <button className="partners__apply" type="button">
          Apply as a Community Partner
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  )
}
