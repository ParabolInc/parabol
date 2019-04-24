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

const backgroundStyles = {
  [PortalState.Entered]: {
    opacity: 1,
    transform: 'scale(1)',
    transition: `all ${Duration.MENU_OPEN}ms ${DECELERATE}`
  },
  [PortalState.Exiting]: {
    opacity: 0,
    transition: `all ${Duration.PORTAL_CLOSE}ms ${DECELERATE}`
  },
  [PortalState.Entering]: {
    opacity: 0,
    transform: `scale(0)`
  }
}

const MenuBackground = styled('div')(
  ({menuPosition, status}: {menuPosition: MenuPosition; status: PortalState}) => ({
    background: '#fff',
    borderRadius: '2px',
    boxShadow: menuShadow,
    height: '100%',
    position: 'absolute',
    transformOrigin: transformOrigins[menuPosition],
    width: '100%',
    zIndex: -1,
    ...backgroundStyles[status]
  })
)

export default MenuBackground
