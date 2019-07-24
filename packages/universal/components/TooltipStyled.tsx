// Styled component for useTooltip
import styled from '@emotion/styled'
import {Radius} from '../types/constEnums'
import {PALETTE} from '../styles/paletteV2'

const TooltipStyled = styled('div')({
  color: '#FFF',
  backgroundColor: PALETTE.BACKGROUND_DARK,
  borderRadius: Radius.TOOLTIP,
  fontSize: 11,
  fontWeight: 600,
  lineHeight: '16px',
  overflow: 'hidden',
  padding: '4px 8px',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  width: '100%'
})

export default TooltipStyled
