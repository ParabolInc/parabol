import styled from '@emotion/styled'
import TooltipStyled from '../components/TooltipStyled'
import {DECELERATE} from '../styles/animation'
import {Duration} from '../types/constEnums'
import {PortalStatus} from './usePortal'

const backgroundStyles = (portalStatus: PortalStatus) => {
  switch (portalStatus) {
    case PortalStatus.Entering:
      // not sure why, but this component is never mounting n the mounted state
      return {
        opacity: 0,
        transform: 'scale(0)',
        transition: `all ${Duration.TOOLTIP_OPEN}ms ${DECELERATE}`
      }
    case PortalStatus.Entered:
      return {
        opacity: 1,
        transform: 'scale(1)',
        transition: `all ${Duration.TOOLTIP_OPEN}ms ${DECELERATE}`
      }
    case PortalStatus.Exiting:
      return {
        opacity: 0,
        transition: `all ${Duration.TOOLTIP_CLOSE}ms ${DECELERATE}`
      }
    case PortalStatus.Mounted:
      return {
        opacity: 0,
        transform: 'scale(0)',
        transition: `all ${Duration.TOOLTIP_OPEN}ms ${DECELERATE}`
      }
    default:
      return {}
  }
}

const TooltipBackground = styled(TooltipStyled)<{portalStatus: PortalStatus}>(({portalStatus}) => ({
  zIndex: -1,
  ...backgroundStyles(portalStatus)
}))

export default TooltipBackground
