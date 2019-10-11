import styled from '@emotion/styled'
import {meetingTopBarMediaQuery} from '../styles/meeting'

const PhaseHeaderTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  padding: 0,
  [meetingTopBarMediaQuery]: {
    fontSize: 20
  }
})

export default PhaseHeaderTitle
