import styled from '@emotion/styled'
import {Breakpoint} from '../../../../types/constEnums'

const NewTeamFormBlock = styled('div')({
  margin: '0 auto 1rem',
  width: '100%',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'space-between'
  }
})

export default NewTeamFormBlock
