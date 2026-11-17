import DOMConfetti from 'react-dom-confetti'

// spread should hit the top left & top right of the screen assuming the start is at the centroid (req'd to look good for mobile)
const spread = 180 - (Math.atan(window.innerHeight / window.innerWidth) / Math.PI) * 180 * 2
const confettiConfig = {
  angle: 90,
  spread,
  startVelocity: 90,
  elementCount: 250,
  decay: 0.88,
  colors: [
    'var(--color-sky-500)',
    'var(--color-tomato-600)',
    'var(--color-rose-500)',
    'var(--color-jade-400)',
    'var(--color-gold-300)',
    'var(--color-grape-700)',
    'var(--color-grape-500)',
    'var(--color-tomato-500)',
    'var(--color-aqua-400)'
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
