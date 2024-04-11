import {PALETTE} from '../styles/paletteV3'
import blendColors from './blendColors'

function getTeamHealthVoteColor(allVotes: readonly number[], vote: number) {
  const minVote = Math.min(...allVotes)
  const maxVote = Math.max(...allVotes)
  const ratio = ((vote - minVote) * 1.0) / maxVote
  const blended = blendColors(PALETTE.GRAPE_500, PALETTE.GRAPE_700, ratio)
  return blended
}

export default getTeamHealthVoteColor
