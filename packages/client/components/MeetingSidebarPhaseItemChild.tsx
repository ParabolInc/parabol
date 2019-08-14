import styled from '@emotion/styled'

const MeetingSidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // required for FF68
  height: '100%' // trickle down height for overflow
})

export default MeetingSidebarPhaseItemChild
