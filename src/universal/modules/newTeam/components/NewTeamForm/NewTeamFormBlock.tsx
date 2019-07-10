import styled from 'react-emotion'
import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'

const NewTeamFormBlock = styled('div')({
  margin: '0 auto 1rem',
  width: '100%',
  [`@media screen and (min-width: ${DASH_SIDEBAR.BREAKPOINT}px)`]: {
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'space-between'
  }
})

export default NewTeamFormBlock
