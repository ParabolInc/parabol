import getWindowSize from 'universal/styles/helpers/getWindowSize'
import {meetingSidebarBreakpoint} from 'universal/styles/meeting'

const sidebarCanAutoCollapse = () => {
  const size = getWindowSize()
  return size.width < meetingSidebarBreakpoint
}

export default sidebarCanAutoCollapse
