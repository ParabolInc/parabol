import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'

const PokerVotingAvatarOverflowCount = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_BLUE_LIGHT,
  border: `2px solid ${PALETTE.BORDER_MATCH_MEETING_COLUMN}`,
  borderRadius: '50%',
  display: 'block',
  flexShrink: 0,
  height: 40,
  position: 'relative',
  width: 40,
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '40px',
  textAlign: 'center'
})

export default PokerVotingAvatarOverflowCount
