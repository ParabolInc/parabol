import styled from 'react-emotion'
import {PortalState} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {Duration} from 'universal/types/constEnums'

const animations = (portalState) => {
  switch (portalState) {
    case PortalState.Entering:
      return {
        opacity: 0
      }
    case PortalState.Entered:
    case PortalState.AnimatedIn:
      return {
        opacity: 1,
        transition: `opacity ${Duration.MENU_OPEN}ms ${DECELERATE}`
      }
    case PortalState.Exiting:
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
  portalState: PortalState
}

const MenuContents = styled('div')(({minWidth, portalState}: MenuContentsProps) => ({
  borderRadius: '2px',
  outline: 0,
  overflowY: portalState >= PortalState.AnimatedIn ? 'auto' : 'hidden',
  paddingBottom: 8,
  paddingTop: 8,
  textAlign: 'left',
  width: '100%',
  opacity: 0,
  transition: `opacity 100ms ${DECELERATE} `,
  minWidth,
  ...animations(portalState)
}))

export default MenuContents
