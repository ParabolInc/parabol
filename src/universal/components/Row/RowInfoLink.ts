import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import {ROW_SUBHEADING_STYLES} from 'universal/styles/rows'

const color = PALETTE.LINK.LIGHT

const RowInfoLink = styled('a')({
  ...ROW_SUBHEADING_STYLES,
  color,
  ':hover, :focus, :active': {
    color,
    textDecoration: 'underline'
  }
})

export default RowInfoLink
