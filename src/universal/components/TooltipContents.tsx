import styled from 'react-emotion'
import {PortalStatus} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {Duration} from 'universal/types/constEnums'
import TooltipStyled from 'universal/components/TooltipStyled'

const animations = (portalStatus) => {
  switch (portalStatus) {
    case PortalStatus.Entering:
      return {
        opacity: 0
      }
    case PortalStatus.Entered:
    case PortalStatus.AnimatedIn:
      return {
        opacity: 1,
        transition: `opacity ${Duration.MENU_OPEN}ms ${DECELERATE}`
      }
    case PortalStatus.Exiting:
      return {
        opacity: 0,
        transition: `opacity ${Duration.PORTAL_CLOSE} ${DECELERATE}`
      }
    default:
      return {}
  }
}

export interface TooltipContentsProps {
  minWidth?: number
  portalStatus: PortalStatus
}

const TooltipContents = styled(TooltipStyled)(({minWidth, portalStatus}: TooltipContentsProps) => ({
  opacity: 0,
  transition: `opacity 100ms ${DECELERATE} `,
  minWidth,
  ...animations(portalStatus)
}))

export default TooltipContents
