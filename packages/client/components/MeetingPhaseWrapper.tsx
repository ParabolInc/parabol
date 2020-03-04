import styled from '@emotion/styled'

const MeetingPhaseWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-around',
  // https://github.com/ParabolInc/parabol/issues/3525
  overflow: 'hidden',
  height: '100%',
  margin: '0 auto',
  width: '100%'
})

export default MeetingPhaseWrapper
