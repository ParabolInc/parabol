import styled from '@emotion/styled'
import {meetingTopBarMediaQuery} from '../styles/meeting'

const PhaseHeaderTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '1.5',
  margin: 0,
  [meetingTopBarMediaQuery]: {
    fontSize: 20,
    lineHeight: '24px',
    marginTop: 4
  }
})

export default PhaseHeaderTitle
