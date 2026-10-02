import { useEffect } from 'react'
import './Intro.css'

interface Props {
  onDone: () => void
}

export default function Intro({ onDone }: Props) {
  // Lock page scrolling while the intro plays so no scrollbars show over it
  useEffect(() => {
    document.documentElement.classList.add('no-scroll')
    return () => document.documentElement.classList.remove('no-scroll')
  }, [])

  return (
    <div className="intro">
      <video
        className="intro__video"
        src="/23251545.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        onEnded={onDone}
        onError={onDone}
      />
    </div>
  )
}
