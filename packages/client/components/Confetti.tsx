import React from 'react'
import DOMConfetti from 'react-dom-confetti'
import appTheme from '../styles/theme/appTheme'

// spread should hit the top left & top right of the screen assuming the start is at the centroid (req'd to look good for mobile)
const spread = 180 - Math.atan(window.innerHeight / window.innerWidth) / Math.PI * 180 * 2
const confettiConfig = {
  angle: 90,
  spread,
  startVelocity: 90,
  elementCount: 250,
  decay: 0.88,
  colors: [
    ...Object.values(appTheme.brand.secondary),
    appTheme.brand.primary.purple,
    appTheme.brand.primary.Lightened,
    appTheme.brand.primary.purpleDarkened,
    appTheme.brand.primary.orange,
    appTheme.brand.primary.teal
  ]
}

interface Props {
  active: boolean
}

const Confetti = (props: Props) => {
  const {active} = props
  return <DOMConfetti active={active} config={confettiConfig} />
}

export default Confetti
