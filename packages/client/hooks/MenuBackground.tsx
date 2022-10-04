import styled from '@emotion/styled'
import {DECELERATE} from '../styles/animation'
import {menuShadow} from '../styles/elevation'
import {Duration, Radius} from '../types/constEnums'
import {MenuPosition} from './useCoords'
import {PortalStatus} from './usePortal'

const transformOrigins = {
  [MenuPosition.UPPER_RIGHT]: 'top right',
  [MenuPosition.UPPER_LEFT]: 'top left',
  [MenuPosition.LOWER_LEFT]: 'bottom left',
  [MenuPosition.LOWER_RIGHT]: 'bottom right'
} as const

const backgroundStyles = (portalStatus: PortalStatus, isDropdown: boolean) => {
  switch (portalStatus) {
    case PortalStatus.Entering:
    case PortalStatus.Entered:
      return {
        opacity: 1,
        transform: isDropdown ? 'scaleY(1)' : 'scale(1)',
        transition: `all ${Duration.MENU_OPEN}ms ${DECELERATE}`
      }
    case PortalStatus.Exiting:
      return {
        opacity: 0,
        transition: `all ${Duration.PORTAL_CLOSE}ms ${DECELERATE}`
      }
    case PortalStatus.Mounted:
      return {
        transform: isDropdown ? 'scaleY(0)' : 'scale(0)'
      }
    default:
      return {}
  }
}

interface BackgroundProps {
  menuPosition: MenuPosition
  portalStatus: PortalStatus
  isDropdown: boolean
}

const MenuBackground = styled('div')<BackgroundProps>(
  ({menuPosition, portalStatus, isDropdown}) => ({
    background: '#FFFFFF',
    borderRadius: Radius.MENU,
    boxShadow: menuShadow,
    height: '100%',
    position: 'absolute',
    transformOrigin: transformOrigins[menuPosition as keyof typeof transformOrigins],
    width: '100%',
    zIndex: -1,
    ...backgroundStyles(portalStatus, isDropdown)
  })
)

export default MenuBackground
