import blendColors from './blendColors'
import {PALETTE} from '../styles/paletteV3'

function getTeamHealthVoteColor(allVotes: readonly number[], vote: number) {
  const sumVotes = allVotes.reduce((acc, vote) => acc + vote, 0)
  const ratio = (vote * 1.0) / sumVotes
  const blended = blendColors(PALETTE.GRAPE_500, PALETTE.GRAPE_700, ratio)
  return blended
}

export default getTeamHealthVoteColor
