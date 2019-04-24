import styled from 'react-emotion'
import {PortalState} from 'universal/hooks/usePortal'
import {Duration} from 'universal/types/constEnums'

const MenuContents = styled('div')(({status}: {status: PortalState}) => ({
  borderRadius: '2px',
  outline: 0,
  overflowY: 'auto',
  paddingBottom: 8,
  paddingTop: 8,
  // this is required to only show the scrollbar after the background has animated in
  opacity: status === PortalState.Entered ? 1 : 0,
  transition: `opacity 10ms ${Duration.MENU_OPEN}ms`,
  textAlign: 'left',
  width: '100%'
}))

export default MenuContents
