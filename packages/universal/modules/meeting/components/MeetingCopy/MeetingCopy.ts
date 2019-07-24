import styled from '@emotion/styled'
import {minWidthMediaQueries} from '../../../../styles/breakpoints'
import {PALETTE} from '../../../../styles/paletteV2'

const MeetingCopy = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 13,
  lineHeight: 1.5,
  margin: '24px 0',

  [minWidthMediaQueries[1]]: {
    fontSize: 15
  }
})

export default MeetingCopy
