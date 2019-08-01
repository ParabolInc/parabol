import styled from '@emotion/styled'
import {DASH_SIDEBAR} from '../../../../components/Dashboard/DashSidebar'

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
