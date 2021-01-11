import styled from '@emotion/styled'
import {Elevation} from '../../styles/elevation'
import {BezierCurve, Card, ElementWidth} from '../../types/constEnums'

const ReflectionCardRoot = styled('div')({
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW,
  // display was 'inline-block' which causes layout issues (TA)
  display: 'block',
  maxWidth: '100%',
  position: 'relative',
  transition: `all 100ms ${BezierCurve.DECELERATE}`,
  minWidth: ElementWidth.REFLECTION_CARD
})

export default ReflectionCardRoot
