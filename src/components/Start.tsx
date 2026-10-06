import './Start.css'

const LOGO = '/loader logo.png'

export default function Start() {
  return (
    <div className="start">
      <div className="start__logo">
        <img className="start__base" src={LOGO} alt="Diversion 2K27" />
        <img className="start__shine" src={LOGO} alt="" aria-hidden="true" />
      </div>
    </div>
  )
}
