import getColorLuminance from './getColorLuminance'

const getPokerCardBackground = (color: string) => {
  return `radial-gradient(50% 50% at 50% 50%, ${color} 0%, ${getColorLuminance(color, -0.12)} 100%)`
}

export default getPokerCardBackground
