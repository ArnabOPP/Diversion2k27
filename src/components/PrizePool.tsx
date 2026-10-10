import './PrizePool.css'

interface PrizePoolProps {
  id?: string
}

export default function PrizePool({ id = 'prizes' }: PrizePoolProps) {
  return (
    <section id={id} className="prize-pool">
      <div className="prize-pool__container">
        <div className="prize-pool__copy">
          <h2 className="prize-pool__title">PRIZE POOL</h2>
          <h3 className="prize-pool__tagline">COMING SOON</h3>
        </div>
      </div>
    </section>
  )
}
