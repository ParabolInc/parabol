import styled from '@emotion/styled'
import RowInfoCopy from './RowInfoCopy'

const color = 'var(--color-fg-secondary)'

const LinkComponent = RowInfoCopy.withComponent('a')

const RowInfoLink = styled(LinkComponent)({
  color,
  ':hover, :focus, :active': {
    color,
    textDecoration: 'underline'
  }
})

export default RowInfoLink
