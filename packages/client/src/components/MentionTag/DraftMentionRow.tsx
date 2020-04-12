import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'

const DraftMentionRow = styled('div')<{active: boolean}>(({active}) => ({
  alignItems: 'center',
  backgroundColor: active ? PALETTE.BACKGROUND_MENTION_HOVER : undefined,
  color: active ? PALETTE.TEXT_MAIN_HOVER : PALETTE.TEXT_MAIN,
  cursor: 'pointer',
  display: 'flex',
  fontSize: 15,
  height: 32,
  lineHeight: '32px',
  padding: `0 16px`,
  ':hover': {
    backgroundColor: PALETTE.BACKGROUND_MENTION_HOVER,
    color: PALETTE.TEXT_MAIN_HOVER
  }
}))

export default DraftMentionRow
