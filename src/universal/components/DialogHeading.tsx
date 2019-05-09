import styled from 'react-emotion'
import {PALETTE} from '../styles/paletteV2'
import TEXT = PALETTE.TEXT

const DialogHeading = styled('h2')({
  color: TEXT.MAIN,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.5,
  margin: 0,
  padding: '24px 24px 0'
})

export default DialogHeading
