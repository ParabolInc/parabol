import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import {PokerCards} from '../types/constEnums'

const NoVotesHeaderLabel = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  paddingLeft: PokerCards.AVATAR_BORDER
})

const PokerVotingNoVotes = () => {
  return <NoVotesHeaderLabel>{'No Votes'}</NoVotesHeaderLabel>
}

export default PokerVotingNoVotes
