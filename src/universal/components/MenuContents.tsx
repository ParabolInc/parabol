import styled from 'react-emotion'
import {PortalStatus} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {Duration} from 'universal/types/constEnums'

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

export interface MenuContentsProps {
  minWidth?: number
  portalStatus: PortalStatus
}

const MenuContents = styled('div')(({minWidth, portalStatus}: MenuContentsProps) => ({
  borderRadius: '2px',
  outline: 0,
  overflowY: portalStatus >= PortalStatus.AnimatedIn ? 'auto' : 'hidden',
  paddingBottom: 8,
  paddingTop: 8,
  textAlign: 'left',
  width: '100%',
  opacity: 0,
  transition: `opacity 100ms ${DECELERATE} `,
  minWidth,
  ...animations(portalStatus)
}))

export default MenuContents
