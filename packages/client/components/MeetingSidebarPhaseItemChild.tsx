import styled from '@emotion/styled'

const MeetingSidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // trickle down height for overflow
  overflow: 'hidden' // required for FF68
})

export default MeetingSidebarPhaseItemChild
