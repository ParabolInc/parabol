import styled from '@emotion/styled'
import FlatButton from '../../../../components/FlatButton'
import {PALETTE} from '../../../../styles/paletteV3'

const ProviderRowActionButton = styled(FlatButton)({
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  minWidth: 36,
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

export default ProviderRowActionButton
