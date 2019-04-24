import styled from 'react-emotion'
import {PortalState} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {Duration} from 'universal/types/constEnums'

const animations = {
  [PortalState.Entered]: {
    // this is required to only show the scrollbar after the background has animated in
    opacity: 1,
    transition: `opacity 1ms ${Duration.MENU_OPEN}ms ${DECELERATE}`
  },
  [PortalState.Exiting]: {
    opacity: 0,
    transition: `opacity 20ms ${DECELERATE}`
  },
  [PortalState.Entering]: {
    opacity: 0
  }
}

const MenuContents = styled('div')(({status}: {status: PortalState}) => ({
  borderRadius: '2px',
  outline: 0,
  overflowY: 'auto',
  paddingBottom: 8,
  paddingTop: 8,
  textAlign: 'left',
  width: '100%',
  ...animations[status]
}))

export default MenuContents
