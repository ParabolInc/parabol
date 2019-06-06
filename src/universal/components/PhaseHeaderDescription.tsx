import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import {meetingTopBarMediaQuery} from 'universal/styles/meeting'

const PhaseHeaderDescription = styled('h2')({
  color: PALETTE.TEXT.LIGHT,
  display: 'none',
  fontWeight: 'normal',
  margin: 0,

  [meetingTopBarMediaQuery]: {
    display: 'block',
    fontSize: '.875rem'
  }
})

export default PhaseHeaderDescription
