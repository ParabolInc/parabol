import styled from 'react-emotion'
import {PortalStatus} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {Duration} from 'universal/types/constEnums'
import TooltipStyled from 'universal/components/TooltipStyled'

const backgroundStyles = (portalStatus: PortalStatus) => {
  switch (portalStatus) {
    case PortalStatus.Entered:
    case PortalStatus.AnimatedIn:
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
    case PortalStatus.Entering:
      return {
        transform: 'scale(0)'
      }
    default:
      return {}
  }
}

const TooltipBackground = styled(TooltipStyled)(
  ({minWidth, portalStatus}: {minWidth?: number; portalStatus: PortalStatus}) => ({
    minWidth,
    zIndex: -1,
    ...backgroundStyles(portalStatus)
  })
)

export default TooltipBackground
