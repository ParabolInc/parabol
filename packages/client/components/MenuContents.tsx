import styled from '@emotion/styled'
import {PortalStatus} from '../hooks/usePortal'
import {DECELERATE} from '../styles/animation'
import {Duration, Radius} from '../types/constEnums'

const animations = (portalStatus: PortalStatus) => {
  switch (portalStatus) {
    case PortalStatus.Mounted:
      return {
        opacity: 0
      }
    case PortalStatus.Entering:
    case PortalStatus.Entered:
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
  menuContentStyles?: any
  portalStatus: PortalStatus
}

const MenuContents = styled('div')<MenuContentsProps>(
  ({minWidth, menuContentStyles = {}, portalStatus}) => ({
    borderRadius: Radius.MENU,
    outline: 0,
    overflowY: portalStatus >= PortalStatus.Entered ? 'auto' : 'hidden',
    paddingBottom: 8,
    paddingTop: 8,
    textAlign: 'left',
    width: '100%',
    opacity: 0,
    transition: `opacity 100ms ${DECELERATE} `,
    minWidth,
    ...animations(portalStatus),
    ...menuContentStyles
  })
)

export default MenuContents
