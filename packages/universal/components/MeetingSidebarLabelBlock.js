import ui from '../styles/ui'
import {meetingSidebarGutterInner} from '../styles/meeting'
import styled from '@emotion/styled'

const MeetingSidebarLabelBlock = styled('div')({
  borderTop: `.0625rem solid ${ui.palette.light}`,
  margin: `1.25rem 0 0 ${meetingSidebarGutterInner}`,
  padding: '1rem 0'
})

export default MeetingSidebarLabelBlock
