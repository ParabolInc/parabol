import styled from '@emotion/styled'
import {PokerCards} from '../types/constEnums'

const NoVotesHeaderLabel = styled('div')({
  color: 'var(--color-fg-secondary)',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  paddingLeft: PokerCards.AVATAR_BORDER
})

const PokerVotingNoVotes = () => {
  return <NoVotesHeaderLabel>{'No Votes'}</NoVotesHeaderLabel>
}

export default PokerVotingNoVotes
