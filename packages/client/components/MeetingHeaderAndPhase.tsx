import styled from '@emotion/styled'

const MeetingHeaderAndPhase = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  minHeight: 0 // FF68 hack to allow discuss tasks to scroll & facilitatorbar to stay visible when shrinking viewpoint height
})

export default MeetingHeaderAndPhase
