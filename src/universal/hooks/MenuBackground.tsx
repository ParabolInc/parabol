import styled from 'react-emotion'
import {MenuPosition} from 'universal/hooks/useCoords'
import {PortalStatus} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {menuShadow} from 'universal/styles/elevation'
import {Duration, Radius} from 'universal/types/constEnums'

const transformOrigins = {
  [MenuPosition.UPPER_RIGHT]: 'top right',
  [MenuPosition.UPPER_LEFT]: 'top left',
  [MenuPosition.LOWER_LEFT]: 'bottom left',
  [MenuPosition.LOWER_RIGHT]: 'bottom right'
}

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

const MenuBackground = styled('div')(
  ({
    menuPosition,
    portalStatus,
    isDropdown
  }: {
    menuPosition: MenuPosition
    portalStatus: PortalStatus
    isDropdown: boolean
  }) => ({
    background: '#fff',
    borderRadius: Radius.MENU,
    boxShadow: menuShadow,
    height: '100%',
    position: 'absolute',
    transformOrigin: transformOrigins[menuPosition],
    width: '100%',
    zIndex: -1,
    ...backgroundStyles(portalStatus, isDropdown)
  })
)

export default MenuBackground
