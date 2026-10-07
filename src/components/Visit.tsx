import './Visit.css'

const asset = (name: string) => encodeURI(`/${name}`)

export default function Visit() {
  return (
    <section id="visit" className="visit">
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
    </section>
  )
}
