import getWindowSize from 'universal/styles/helpers/getWindowSize'
import {meetingSidebarBreakpoint} from 'universal/styles/meeting'

const sidebarCanAutoCollapse = () => {
  const size = getWindowSize()
  if (size.width < meetingSidebarBreakpoint) {
    return true
  } else {
    return false
  }
}

export default sidebarCanAutoCollapse
