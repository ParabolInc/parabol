import {PALETTE} from '../styles/paletteV2'
import {meetingSidebarGutterInner} from '../styles/meeting'
import styled from '@emotion/styled'

const MeetingSidebarLabelBlock = styled('div')({
  borderTop: `1px solid ${PALETTE.BACKGROUND_MAIN}`,
  margin: `20px 0 0 ${meetingSidebarGutterInner}`,
  padding: '16px 0'
})

export default MeetingSidebarLabelBlock
