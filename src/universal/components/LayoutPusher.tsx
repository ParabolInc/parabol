import styled from 'react-emotion'
import {meetingSidebarMediaQuery, meetingSidebarWidth} from 'universal/styles/meeting'

const LayoutPusher = styled('div')(
  ({isMeetingSidebarCollapsed}: {isMeetingSidebarCollapsed: boolean}) => ({
    display: 'none',

    [meetingSidebarMediaQuery]: {
      display: 'block',
      flexShrink: 0,
      transition: `width 100ms`,
      width: isMeetingSidebarCollapsed ? 0 : meetingSidebarWidth
    }
  })
)

export default LayoutPusher
