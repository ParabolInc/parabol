import styled from 'react-emotion'
import {MenuPosition} from 'universal/hooks/useCoords'
import {PortalState} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {menuShadow} from 'universal/styles/elevation'
import {Duration} from 'universal/types/constEnums'

const transformOrigins = {
  [MenuPosition.UPPER_RIGHT]: 'top right',
  [MenuPosition.UPPER_LEFT]: 'top left',
  [MenuPosition.LOWER_LEFT]: 'bottom left',
  [MenuPosition.LOWER_RIGHT]: 'bottom right'
}

const backgroundStyles = (portalState: PortalState, isDropdown: boolean) => {
  switch (portalState) {
    case PortalState.Entered:
    case PortalState.AnimatedIn:
      return {
        opacity: 1,
        transform: isDropdown ? 'scaleY(1)' : 'scale(1)',
        transition: `all ${Duration.MENU_OPEN}ms ${DECELERATE}`
      }
    case PortalState.Exiting:
      return {
        opacity: 0,
        transition: `all ${Duration.PORTAL_CLOSE}ms ${DECELERATE}`
      }
    case PortalState.Entering:
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
    portalState,
    isDropdown
  }: {
    menuPosition: MenuPosition
    portalState: PortalState
    isDropdown: boolean
  }) => ({
    background: '#fff',
    borderRadius: '2px',
    boxShadow: menuShadow,
    height: '100%',
    position: 'absolute',
    transformOrigin: transformOrigins[menuPosition],
    width: '100%',
    zIndex: -1,
    ...backgroundStyles(portalState, isDropdown)
  })
)

export default MenuBackground
