import styled from 'react-emotion'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {PALETTE} from 'universal/styles/paletteV2'

const MeetingCopy = styled('div')({
  color: PALETTE.TEXT.MAIN,
  fontSize: 13,
  lineHeight: 1.5,
  margin: '24px 0',

  [minWidthMediaQueries[1]]: {
    fontSize: 15
  }
})

export default MeetingCopy
