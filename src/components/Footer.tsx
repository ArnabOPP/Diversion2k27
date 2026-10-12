import './Footer.css'

const SOCIALS = [
  { name: 'X', href: 'https://x.com/Diversion2K27' },
  { name: 'Instagram', href: 'https://www.instagram.com/diversion_iem_acm/?hl=en' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/acm-iem' },
]

const LINKS = [
  { label: 'IEM-ACM Student Chapter', href: '#' },
  { label: 'MLH Code of Conduct', href: 'https://mlh.io/code-of-conduct' },
  { label: 'Privacy', href: '#' },
  { label: 'Contact', href: '#contact' },
  { label: 'FAQ', href: '#faq' },
]

function SocialIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'X':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      )
    case 'Instagram':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" />
        </svg>
      )
    case 'LinkedIn':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 11v5M8 8h.01M12 16v-5M12 13a2.5 2.5 0 0 1 5 0v3" />
        </svg>
      )
    default:
      return null
  }
}

export default function Footer() {
  return (
    <footer className="footer">
      <a className="footer__pill" href="#contact">
        <span className="footer__pill-title">
          <img src="/diversion%206%20logo.png" alt="" aria-hidden="true" />
          GET DIVERSION UPDATES
        </span>
        <span className="footer__pill-text">
          Get the latest announcements, updates on events, sponsors and more from Diversion 2K27.
        </span>
      </a>

      <ul className="footer__socials">
        {SOCIALS.map((s) => (
          <li key={s.name}>
            <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
              <SocialIcon name={s.name} />
            </a>
          </li>
        ))}
      </ul>

      <ul className="footer__links">
        {LINKS.map((l) => (
          <li key={l.label}>
            <a href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="footer__legal">
        <img src="/diversion%20logo.png" alt="Diversion 2K27" />
        <div>
          <p>
            Diversion 2K27 is an independent student technology event organized by the IEM-ACM Student Chapter, Kolkata. This event
            is not affiliated with, sponsored by, endorsed by, or connected to Rockstar Games, Take-Two Interactive, or Grand Theft
            Auto. All event names, artwork and original materials belong to their respective owners.
          </p>
          <p className="footer__copy">&copy; 2027 DIVERSION / IEM-ACM Student Chapter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
