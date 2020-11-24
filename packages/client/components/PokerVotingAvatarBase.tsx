import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'

const PokerVotingAvatarBase = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_ORANGE,
  // Border color needs to be solid and match the column background
  // to create the gap effect between overlapping avatars
  border: `2px solid ${PALETTE.BORDER_MATCH_MEETING_COLUMN}`,
  borderRadius: '50%',
  display: 'block',
  flexShrink: 0,
  height: 44,
  marginLeft: -10,
  position: 'relative',
  width: 44
})

export default PokerVotingAvatarBase
