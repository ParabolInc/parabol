import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'

const PhaseHeaderDescription = styled('h2')({
  color: PALETTE.TEXT.LIGHT,
  display: 'none',
  fontWeight: 'normal',
  margin: 0,

  [minWidthMediaQueries[1]]: {
    display: 'block',
    fontSize: '.875rem'
  }
})

export default PhaseHeaderDescription
