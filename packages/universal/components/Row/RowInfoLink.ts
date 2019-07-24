import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import RowInfoCopy from './RowInfoCopy'

const color = PALETTE.LINK_LIGHT

const LinkComponent = RowInfoCopy.withComponent('a')

const RowInfoLink = styled(LinkComponent)({
  color,
  ':hover, :focus, :active': {
    color,
    textDecoration: 'underline'
  }
})

export default RowInfoLink
