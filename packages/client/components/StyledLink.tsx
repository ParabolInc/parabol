import styled from '@emotion/styled'
import {Link} from 'react-router-dom'
import {PALETTE} from '../styles/paletteV2'

const StyledLink = styled(Link)({
  color: PALETTE.LINK_BLUE,
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.LINK_BLUE_HOVER
  }
})

export default StyledLink
