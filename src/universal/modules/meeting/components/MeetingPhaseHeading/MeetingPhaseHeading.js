import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {fontSize} from 'universal/styles/theme/typography'

const MeetingPhaseHeading = styled('div')({
  color: ui.palette.dark,
  fontSize: fontSize[8],
  fontWeight: 600,
  lineHeight: 1.25,
  textAlign: 'left'
})

export default MeetingPhaseHeading
