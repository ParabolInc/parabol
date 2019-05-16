// Styled component for useTooltip
import styled from 'react-emotion'
import {Radius} from 'universal/types/constEnums'
import {PALETTE} from 'universal/styles/paletteV2'

const TooltipStyled = styled('div')({
  color: '#FFF',
  backgroundColor: PALETTE.BACKGROUND.DARK,
  borderRadius: Radius.SMALL,
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
