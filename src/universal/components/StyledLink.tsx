import styled from 'react-emotion'
import {Link} from 'react-router-dom'
import {PALETTE} from '../styles/paletteV2'
import LINK = PALETTE.LINK

const StyledLink = styled(Link)({
  color: LINK.COLOR
})

export default StyledLink
