import './PrizePool.css'

interface PrizePoolProps {
  id?: string
}

export default function PrizePool({ id = 'prizes' }: PrizePoolProps) {
  return (
    <section id={id} className="prize-pool">
      <div className="prize-pool__container">
        <header className="prize-pool__header">
          <div className="prize-pool__badge">DIVERSION 2K27 REWARDS</div>
          <h2 className="prize-pool__title">PRIZE POOL</h2>
          <h3 className="prize-pool__tagline">
            Big bounties, cash rewards & exclusive perks for bold builders.
          </h3>
          <div className="prize-pool__highlight">
            <span className="prize-pool__highlight-label">TOTAL POOL VALUE</span>
            <span className="prize-pool__highlight-val">₹1,00,000+</span>
            <span className="prize-pool__highlight-sub">Cash Prizes, Sponsor Bounties & Exclusive Swag</span>
          </div>
        </header>

        {/* Podium: 2nd, 1st (center/tall), 3rd */}
        <div className="prize-pool__podium">
          {/* 2nd Place */}
          <div className="prize-card prize-card--silver">
            <div className="prize-card__badge">RUNNER-UP</div>
            <div className="prize-card__trophy">🥈</div>
            <div className="prize-card__rank">2ND PLACE</div>
            <div className="prize-card__amount">₹25,000+</div>
            <p className="prize-card__desc">
              Cash prize, silver trophy, certificate of excellence, and sponsor credits.
            </p>
            <ul className="prize-card__perks">
              <li>Silver Trophy & Certificates</li>
              <li>Sponsor Cloud Credits</li>
              <li>Exclusive Swag Kit</li>
            </ul>
          </div>

          {/* 1st Place */}
          <div className="prize-card prize-card--gold prize-card--featured">
            <div className="prize-card__badge prize-card__badge--gold">CHAMPIONS</div>
            <div className="prize-card__trophy prize-card__trophy--gold">🏆</div>
            <div className="prize-card__rank">1ST PLACE</div>
            <div className="prize-card__amount">₹50,000+</div>
            <p className="prize-card__desc">
              Grand cash prize, champion trophy, incubator & investor pitch access, and mentorship.
            </p>
            <ul className="prize-card__perks">
              <li>Grand Trophy & Gold Badges</li>
              <li>Pitch & Mentorship Access</li>
              <li>Premium Developer Perks & Credits</li>
              <li>Exclusive Winner Swag Box</li>
            </ul>
          </div>

          {/* 3rd Place */}
          <div className="prize-card prize-card--bronze">
            <div className="prize-card__badge">2ND RUNNER-UP</div>
            <div className="prize-card__trophy">🥉</div>
            <div className="prize-card__rank">3RD PLACE</div>
            <div className="prize-card__amount">₹15,000+</div>
            <p className="prize-card__desc">
              Cash prize, bronze trophy, developer perks, and premium swag kits.
            </p>
            <ul className="prize-card__perks">
              <li>Bronze Trophy & Certificates</li>
              <li>Tooling & Cloud Subscriptions</li>
              <li>Exclusive Swag Kit</li>
            </ul>
          </div>
        </div>

        {/* Special Category & Track Bounties */}
        <div className="prize-pool__tracks">
          <div className="prize-track">
            <div className="prize-track__icon">⚡</div>
            <div className="prize-track__info">
              <h4>Best All-Girls Team</h4>
              <p>Special cash prize & mentorship for the top all-women hacking team.</p>
            </div>
            <span className="prize-track__tag">SPECIAL PRIZE</span>
          </div>

          <div className="prize-track">
            <div className="prize-track__icon">🚀</div>
            <div className="prize-track__info">
              <h4>Best Beginner Hack</h4>
              <p>Encouraging first-time hackers who build inventive, high-impact projects.</p>
            </div>
            <span className="prize-track__tag">TRACK BOUNTY</span>
          </div>

          <div className="prize-track">
            <div className="prize-track__icon">🤖</div>
            <div className="prize-track__info">
              <h4>Best AI / ML Innovation</h4>
              <p>For the project that pushes boundaries using state-of-the-art AI technology.</p>
            </div>
            <span className="prize-track__tag">TRACK BOUNTY</span>
          </div>

          <div className="prize-track">
            <div className="prize-track__icon">🎁</div>
            <div className="prize-track__info">
              <h4>Swag For All Participants</h4>
              <p>Every attendee receives official stickers, t-shirts, badges & refreshments.</p>
            </div>
            <span className="prize-track__tag">FOR EVERYONE</span>
          </div>
        </div>

        <div className="prize-pool__note">
          <p>
            * Specific track bounties, partner API challenges, and prize breakdowns will be announced in detail leading up to hack day.
          </p>
        </div>
      </div>
    </section>
  )
}
