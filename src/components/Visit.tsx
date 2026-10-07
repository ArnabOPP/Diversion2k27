import './Visit.css'

const asset = (name: string) => encodeURI(`/${name}`)

export default function Visit() {
  return (
    <section id="visit" className="visit">
      <div className="visit__content">
        <header className="visit__header">
          <div className="visit__logo" aria-label="Visit Diversion">
            <span className="visit__logo-visit">VISIT</span>
            <span className="visit__logo-name">DIVERSION</span>
            <img src={asset('Scroll Down (18).png')} alt="" aria-hidden="true" />
          </div>
          <p className="visit__blurb">Tour a few of the must-see destinations across the City of Joy.</p>
        </header>

      <figure className="visit__card">
        <img className="visit__photo" src={asset('Scroll Down (15).png')} alt="Biswa Bangla Gate and the Kolkata skyline" />

        <p className="visit__title">City of Joy</p>

        <div className="visit__brand">
          <span>VISIT</span>
          <span className="visit__brand-name">
            DIVERSION
            <img src={asset('Scroll Down (18).png')} alt="" aria-hidden="true" />
          </span>
        </div>

        <button className="visit__button" type="button">
          Explore Kolkata City
        </button>
      </figure>
      </div>
    </section>
  )
}
