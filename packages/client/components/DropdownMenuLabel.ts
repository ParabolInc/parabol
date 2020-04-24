import styled from '@emotion/styled'
import textOverflow from '../styles/helpers/textOverflow'
import {PALETTE} from '../styles/paletteV2'

const DropdownMenuLabel = styled('div')<{isEmpty?: boolean}>(({isEmpty}) => ({
  ...textOverflow,
  borderBottom: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  color: PALETTE.TEXT_MAIN,
  fontSize: 15,
  fontWeight: 600,
  lineHeight: '32px',
  marginBottom: isEmpty ? -8 : 8,
  padding: `0 16px`,
  userSelect: 'none'
}))

export default DropdownMenuLabel
