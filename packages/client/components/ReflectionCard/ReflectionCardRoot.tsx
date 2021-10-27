import styled from '@emotion/styled'
import {DECELERATE} from '~/styles/animation'
import {Elevation} from '../../styles/elevation'
import {Card, ElementWidth} from '../../types/constEnums'

const ReflectionCardRoot = styled('div')<{selectedForSpotlight?: boolean}>(
  ({selectedForSpotlight}) => ({
    background: Card.BACKGROUND_COLOR,
    borderRadius: Card.BORDER_RADIUS,
    boxShadow: Elevation.CARD_SHADOW,
    // display was 'inline-block' which causes layout issues (TA)
    display: 'block',
    maxWidth: '100%',
    // opacity: 1,
    opacity: selectedForSpotlight ? 0 : 1,
    position: 'relative',
    // transition: 'all 300ms ease-in',
    transition: `box-shadow 2000ms ${DECELERATE} ${
      selectedForSpotlight ? `,opacity 200ms ${DECELERATE}` : ''
    }`,
    width: ElementWidth.REFLECTION_CARD
  })
)

export default ReflectionCardRoot
