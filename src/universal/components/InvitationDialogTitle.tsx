import styled from 'react-emotion'
import {PALETTE} from '../styles/paletteV2'
import TEXT = PALETTE.TEXT

const InvitationDialogTitle = styled('h2')({
  color: TEXT.MAIN,
  fontSize: '1.25rem',
  fontWeight: 600,
  lineHeight: 1.5,
  margin: 0,
  padding: '1.5rem 2rem 0'
})

export default InvitationDialogTitle
