import styled from '@emotion/styled'
import {Link} from 'react-router'
import {PALETTE} from '../styles/paletteV3'

const StyledLink = styled(Link)({
  color: 'var(--color-accent)',
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
})

export default StyledLink
