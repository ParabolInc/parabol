import styled from '@emotion/styled'

const MeetingContent = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  // important! don't let the phase area (eg reflection columns) overflow.
  // instead, put sub components in overflow containers
  overflow: 'hidden',
  width: '100%'
})

export default MeetingContent
