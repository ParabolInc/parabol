import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import {meetingTopBarMediaQuery} from '../styles/meeting'

const PhaseHeaderDescription = styled('h2')({
  color: PALETTE.TEXT_GRAY,
  display: 'none',
  fontWeight: 'normal',
  margin: 0,

  [meetingTopBarMediaQuery]: {
    display: 'block',
    fontSize: 13,
    lineHeight: '16px',
    marginTop: 4
  }
})

export default PhaseHeaderDescription
