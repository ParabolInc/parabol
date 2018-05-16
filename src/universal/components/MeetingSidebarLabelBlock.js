import ui from 'universal/styles/ui'
import styled from 'react-emotion'

const MeetingSidebarLabelBlock = styled('div')({
  borderTop: `.0625rem solid ${ui.palette.light}`,
  margin: `1.25rem 0 0 ${ui.meetingSidebarGutterInner}`,
  padding: '1rem 0'
})

export default MeetingSidebarLabelBlock
