import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import {DECELERATE} from '~/styles/animation'
import {Elevation} from '../../styles/elevation'
import {Card, ElementWidth} from '../../types/constEnums'

const dragPrompt = keyframes`
  0%, 1.5%, 2%, 3.5%, 100% {
    left: 0px;
    top: 0px;
    box-shadow: rgba(0,0,0,.08) 0px 1px 3px 0px;
  }
  1% {
    left: 10px;
    top: -5px;
    box-shadow: rgba(0,0,0,.2) 0px 5px 5px -3px, rgba(0,0,0,.14) 0px 8px 10px 1px, rgba(0,0,0,.12) 0px 3px 14px 2px;
  }
  3% {
    left: 10px;
    top: -5px;
    box-shadow: rgba(0,0,0,.2) 0px 5px 5px -3px, rgba(0,0,0,.14) 0px 8px 10px 1px, rgba(0,0,0,.12) 0px 3px 14px 2px;
  }
`

const ReflectionCardRoot = styled('div')<{shouldAnimate?: () => boolean}>(({shouldAnimate}) => ({
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW,
  // display was 'inline-block' which causes layout issues (TA)
  display: 'block',
  maxWidth: '100%',
  position: 'relative',
  transition: `box-shadow 2000ms ${DECELERATE}`,
  width: ElementWidth.REFLECTION_CARD,
  animation: shouldAnimate && shouldAnimate() ? `${dragPrompt}  60s 2s infinite` : undefined
}))

export default ReflectionCardRoot
