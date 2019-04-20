import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import FlatButton from 'universal/components/FlatButton'

const SecondaryButton = styled(FlatButton)({
  borderColor: PALETTE.BORDER.LIGHT,
  color: PALETTE.TEXT.MAIN,
  fontWeight: 600
})

export default SecondaryButton
