import React from 'react'
import DOMConfetti from 'react-dom-confetti'
import {PALETTE} from '../styles/paletteV2'

// spread should hit the top left & top right of the screen assuming the start is at the centroid (req'd to look good for mobile)
const spread = 180 - (Math.atan(window.innerHeight / window.innerWidth) / Math.PI) * 180 * 2
const confettiConfig = {
  angle: 90,
  spread,
  startVelocity: 90,
  elementCount: 250,
  decay: 0.88,
  colors: [
    PALETTE.BACKGROUND_BLUE,
    PALETTE.BACKGROUND_RED,
    PALETTE.BACKGROUND_PINK,
    PALETTE.BACKGROUND_GREEN,
    PALETTE.BACKGROUND_YELLOW,
    PALETTE.PRIMARY_MAIN,
    PALETTE.PRIMARY_LIGHT,
    PALETTE.BACKGROUND_ORANGE,
    PALETTE.BACKGROUND_TEAL
  ]
}

interface Props {
  active: boolean
}

const Confetti = (props: Props) => {
  const {active} = props
  return <DOMConfetti active={active} config={confettiConfig as object} />
}

export default Confetti
