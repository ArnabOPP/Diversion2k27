import './PastGlimpses.css'

const GLIMPSE_IMAGES: string[] = [
  'WhatsApp Image 2026-10-12 at 01.41.16.jpeg',
  'WhatsApp Image 2026-10-12 at 01.43.10.jpeg',
  'WhatsApp Image 2026-10-12 at 01.43.21.jpeg',
  'WhatsApp Image 2026-10-12 at 01.47.33.jpeg',
  'WhatsApp Image 2026-10-12 at 01.47.46.jpeg',
  'WhatsApp Image 2026-10-12 at 01.47.55.jpeg',
  'WhatsApp Image 2026-10-12 at 01.49.00.jpeg',
  'WhatsApp Image 2026-10-12 at 01.51.53.jpeg',
  'WhatsApp Image 2026-10-12 at 01.55.04.jpeg',
  'WhatsApp Image 2026-10-12 at 01.56.22.jpeg',
  'WhatsApp Image 2026-10-12 at 01.56.34.jpeg',
  'WhatsApp Image 2026-10-12 at 01.58.08.jpeg',
  'WhatsApp Image 2026-10-12 at 01.59.12.jpeg',
  'WhatsApp Image 2026-10-12 at 01.59.21.jpeg',
  'WhatsApp Image 2026-10-12 at 02.00.15.jpeg',
  'WhatsApp Image 2026-10-12 at 02.01.25.jpeg',
  'WhatsApp Image 2026-10-12 at 02.03.40.jpeg',
  'WhatsApp Image 2026-10-12 at 02.04.00.jpeg',
  'WhatsApp Image 2026-10-12 at 02.05.09.jpeg',
  'WhatsApp Image 2026-10-12 at 02.06.39.jpeg',
  'WhatsApp Image 2026-10-12 at 02.08.05.jpeg',
  'WhatsApp Image 2026-10-12 at 02.08.27.jpeg',
  'WhatsApp Image 2026-10-12 at 02.09.06.jpeg',
  'WhatsApp Image 2026-10-12 at 02.10.08.jpeg',
  'WhatsApp Image 2026-10-12 at 02.11.00.jpeg',
  'WhatsApp Image 2026-10-12 at 02.11.09.jpeg',
  'WhatsApp Image 2026-10-12 at 02.12.31.jpeg',
]

const getImgSrc = (filename: string) =>
  `/diversion%202k26/${encodeURIComponent(filename)}`

interface PastGlimpsesProps {
  id?: string
}

export default function PastGlimpses({ id = 'past-glimpses' }: PastGlimpsesProps) {
  // Split photos into 2 balanced rows for a continuous, multi-directional dual marquee
  const row1 = GLIMPSE_IMAGES.slice(0, 14)
  const row2 = GLIMPSE_IMAGES.slice(14)

  return (
    <section id={id} className="past-glimpses">
      {/* Background ambient lighting */}
      <div className="past-glimpses__bg-glow" aria-hidden="true" />

      {/* Header section */}
      <div className="past-glimpses__header">
        <h2 className="past-glimpses__title">PAST GLIMPSES</h2>
        <p className="past-glimpses__tagline">
          Surveillance tapes recovered from the 2K26 heist. 36 hours of rogue code, sleepless syndicates, and pure adrenaline on the streets of Kolkata.
        </p>
      </div>

      {/* Carousel Track Container */}
      <div className="past-glimpses__carousel">
        {/* Row 1: Leftward continuous scroll */}
        <div className="glimpses-track glimpses-track--row1">
          <div className="glimpses-track__inner glimpses-track__inner--left">
            {[...row1, ...row1].map((file, idx) => {
              const src = getImgSrc(file)
              const alt = `Diversion 2K26 memory ${idx + 1}`
              return (
                <div key={`r1-${idx}`} className="glimpse-card">
                  <img
                    className="glimpse-card__img"
                    src={src}
                    alt={alt}
                    loading="lazy"
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Row 2: Rightward continuous scroll */}
        <div className="glimpses-track glimpses-track--row2">
          <div className="glimpses-track__inner glimpses-track__inner--right">
            {[...row2, ...row2].map((file, idx) => {
              const src = getImgSrc(file)
              const alt = `Diversion 2K26 memory ${idx + 15}`
              return (
                <div key={`r2-${idx}`} className="glimpse-card">
                  <img
                    className="glimpse-card__img"
                    src={src}
                    alt={alt}
                    loading="lazy"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
