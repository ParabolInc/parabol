import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import FlatButton from './FlatButton'

// Blue, cool emphasis
const SecondaryButtonCool = styled(FlatButton)({
  backgroundColor: 'transparent',
  borderColor: 'currentColor',
  color: PALETTE.LINK_BLUE,
  fontWeight: 600,
  ':hover, :focus, :active': {
    backgroundColor: 'transparent',
    color: PALETTE.LINK_BLUE_HOVER
  }
})

export default SecondaryButtonCool
