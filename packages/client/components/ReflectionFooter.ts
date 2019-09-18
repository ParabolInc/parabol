import styled from '@emotion/styled'
import textOverflow from '../styles/helpers/textOverflow'
import {PALETTE} from '../styles/paletteV2'
import {Card} from '../types/constEnums'

const ReflectionFooter = styled('div')({
  ...textOverflow,
  alignItems: 'flex-start',
  backgroundColor: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  color: PALETTE.TEXT_GRAY,
  fontSize: 13,
  padding: '8px 12px',
  userSelect: 'none'
})

export default ReflectionFooter
