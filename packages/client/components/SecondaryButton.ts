import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import FlatButton from './FlatButton'

// Gray, neutral emphasis
const SecondaryButton = styled(FlatButton)({
  borderColor: PALETTE.BORDER_LIGHT,
  color: PALETTE.TEXT_MAIN,
  fontWeight: 600
})

export default SecondaryButton
