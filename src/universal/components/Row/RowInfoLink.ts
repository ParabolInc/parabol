import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import RowInfoCopy from './RowInfoCopy'

const color = PALETTE.LINK.LIGHT

const LinkComponent = RowInfoCopy.withComponent('a')

const RowInfoLink = styled(LinkComponent)({
  color,
  ':hover, :focus, :active': {
    color,
    textDecoration: 'underline'
  }
})

export default RowInfoLink
