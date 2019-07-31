import React from 'react'
import DOMConfetti from 'react-dom-confetti'
import appTheme from '../styles/theme/appTheme'

const confettiConfig = {
  angle: 90,
  spread: 150,
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
