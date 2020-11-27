import styled from '@emotion/styled'
import {DECELERATE} from '../../styles/animation'
import {Elevation} from '../../styles/elevation'
import {Card, ElementWidth} from '../../types/constEnums'

const ReflectionCardRoot = styled('div')<{isExpanded?: boolean}>(({isExpanded = false}) => ({
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW,
  // display was 'inline-block' which causes layout issues (TA)
  display: 'block',
  maxWidth: '100%',
  position: 'relative',
  transition: `box-shadow 2000ms ${DECELERATE}`,
  width: isExpanded ? ElementWidth.REFLECTION_CARD * 2: ElementWidth.REFLECTION_CARD 
}))

export default ReflectionCardRoot
